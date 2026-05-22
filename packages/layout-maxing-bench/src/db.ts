// SQLite wrapper. Uses npm:better-sqlite3 — sync API, plenty fast for our write rate.
// Schema kept additive: new columns ALTER TABLE on open. bench.db is gitignored.

import { DatabaseSync } from 'node:sqlite'

export type RunStatus = 'pending' | 'ok' | 'error' | 'timeout' | 'skipped'
export type GroupName = 'baseline' | 'preset' | 'oat' | 'stagnation' | 'niching' | 'cluster' | 'mutweights' | 'fitness' | 'gapfill' | 'verify'

export interface RunRow {
  id: number
  created_at: string
  git_sha: string
  example: string
  preset: string | null
  group_name: GroupName
  sample_seed: number
  ga_seed: number
  config_json: string
  status: RunStatus
  error: string | null
  evals_total: number | null
  evals_main: number | null
  evals_cluster: number | null
  generations_actual: number | null
  wall_ms: number | null
  score_custom: number | null
  score_default: number | null
  crossings: number | null
  overlaps: number | null
  collisions: number | null
  area: number | null
  view: number | null
  total_dist: number | null
  misaligned_ss: number | null
  notes: string | null
}

const SCHEMA_VERSION = 1

const SCHEMA = `
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  git_sha TEXT NOT NULL,
  example TEXT NOT NULL,
  preset TEXT,
  group_name TEXT NOT NULL,
  sample_seed INTEGER NOT NULL,
  ga_seed INTEGER NOT NULL,
  config_json TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  evals_total INTEGER,
  evals_main INTEGER,
  evals_cluster INTEGER,
  generations_actual INTEGER,
  wall_ms INTEGER,
  score_custom REAL,
  score_default REAL,
  crossings INTEGER,
  overlaps INTEGER,
  collisions INTEGER,
  area REAL,
  view REAL,
  total_dist REAL,
  misaligned_ss INTEGER,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS runs_example_group ON runs(example, group_name);
CREATE INDEX IF NOT EXISTS runs_score_default ON runs(example, score_default);
CREATE INDEX IF NOT EXISTS runs_group_sample ON runs(group_name, sample_seed);

CREATE TABLE IF NOT EXISTS param_values (
  run_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY(run_id, name)
);
CREATE INDEX IF NOT EXISTS param_values_name ON param_values(name);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`

export class BenchDb {
  private db: any

  constructor(path: string) {
    this.db = new DatabaseSync(path)
    this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec('PRAGMA synchronous = NORMAL')
    this.db.exec(SCHEMA)
    const cur = this.db.prepare(`SELECT value FROM meta WHERE key='schema_version'`).get() as { value: string } | undefined
    if (!cur) {
      this.db.prepare(`INSERT INTO meta(key,value) VALUES('schema_version', ?)`).run(String(SCHEMA_VERSION))
    }
  }

  close() {
    this.db.close()
  }

  insertRun(row: Omit<RunRow, 'id'>, paramValues: Record<string, number>): number {
    this.db.exec('BEGIN')
    try {
      const info = this.db
        .prepare(
          `INSERT INTO runs (
            created_at, git_sha, example, preset, group_name, sample_seed, ga_seed,
            config_json, status, error,
            evals_total, evals_main, evals_cluster, generations_actual, wall_ms,
            score_custom, score_default,
            crossings, overlaps, collisions, area, view, total_dist, misaligned_ss, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          row.created_at,
          row.git_sha,
          row.example,
          row.preset,
          row.group_name,
          row.sample_seed,
          row.ga_seed,
          row.config_json,
          row.status,
          row.error,
          row.evals_total,
          row.evals_main,
          row.evals_cluster,
          row.generations_actual,
          row.wall_ms,
          row.score_custom,
          row.score_default,
          row.crossings,
          row.overlaps,
          row.collisions,
          row.area,
          row.view,
          row.total_dist,
          row.misaligned_ss,
          row.notes,
        )
      const runId = Number(info.lastInsertRowid)
      const ins = this.db.prepare(`INSERT INTO param_values(run_id, name, value) VALUES(?, ?, ?)`)
      for (const [name, value] of Object.entries(paramValues)) ins.run(runId, name, value)
      this.db.exec('COMMIT')
      return runId
    } catch (e) {
      this.db.exec('ROLLBACK')
      throw e
    }
  }

  // Returns the next free sample_seed for a (group, example) pair. Used to resume.
  nextSampleSeed(group: GroupName, example: string): number {
    const row = this.db.prepare(`SELECT MAX(sample_seed) AS m FROM runs WHERE group_name=? AND example=?`).get(group, example) as { m: number | null }
    return (row.m ?? -1) + 1
  }

  hasSample(group: GroupName, example: string, sampleSeed: number): boolean {
    const row = this.db.prepare(`SELECT 1 FROM runs WHERE group_name=? AND example=? AND sample_seed=?`).get(group, example, sampleSeed) as unknown
    return !!row
  }

  recentRuns(limit = 20): RunRow[] {
    return this.db.prepare(`SELECT * FROM runs ORDER BY id DESC LIMIT ?`).all(limit) as RunRow[]
  }

  bestPerExample(): RunRow[] {
    return this.db
      .prepare(
        `SELECT r.* FROM runs r
         JOIN (SELECT example, MIN(score_default) AS s FROM runs WHERE status='ok' GROUP BY example) b
           ON b.example = r.example AND b.s = r.score_default
         WHERE r.status='ok'
         GROUP BY r.example`,
      )
      .all() as RunRow[]
  }

  runsBy(filter: { group?: GroupName; example?: string; limit?: number }): RunRow[] {
    const where: string[] = []
    const args: unknown[] = []
    if (filter.group) {
      where.push('group_name=?')
      args.push(filter.group)
    }
    if (filter.example) {
      where.push('example=?')
      args.push(filter.example)
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const lim = filter.limit ?? 500
    return this.db.prepare(`SELECT * FROM runs ${w} ORDER BY id DESC LIMIT ?`).all(...args, lim) as RunRow[]
  }

  getRun(id: number): RunRow | undefined {
    return this.db.prepare(`SELECT * FROM runs WHERE id=?`).get(id) as RunRow | undefined
  }

  paramsFor(runId: number): Record<string, number> {
    const rows = this.db.prepare(`SELECT name, value FROM param_values WHERE run_id=?`).all(runId) as {
      name: string
      value: number
    }[]
    return Object.fromEntries(rows.map((r) => [r.name, r.value]))
  }

  // Top-K configs that have all 4 non-clustered examples, ranked by sum(score_default).
  // Returns one representative run_id per config (the example-1 row) for the caller
  // to build verify WorkItems from.
  topCandidates(k = 10): { run_id: number; group_name: string; sample_seed: number; sum_d: number }[] {
    return this.db
      .prepare(
        `SELECT MIN(id) AS run_id, group_name, sample_seed,
              SUM(score_default) AS sum_d
       FROM runs
       WHERE status='ok'
         AND group_name NOT IN ('baseline','preset','verify')
         AND example IN ('example-1','example-2','example-3','example-4')
       GROUP BY group_name, sample_seed
       HAVING COUNT(DISTINCT example) = 4
       ORDER BY sum_d ASC
       LIMIT ?`,
      )
      .all(k) as { run_id: number; group_name: string; sample_seed: number; sum_d: number }[]
  }

  // Top-K ex5 candidates.
  topCandidatesEx5(k = 5): { run_id: number; group_name: string; sample_seed: number; score_d: number }[] {
    return this.db
      .prepare(
        `SELECT id AS run_id, group_name, sample_seed, score_default AS score_d
       FROM runs
       WHERE status='ok'
         AND group_name NOT IN ('baseline','preset','verify')
         AND example = 'example-5'
       ORDER BY score_d ASC
       LIMIT ?`,
      )
      .all(k) as { run_id: number; group_name: string; sample_seed: number; score_d: number }[]
  }

  // All verify rows for a given parent run id.
  verifyRowsFor(parentRunId: number): RunRow[] {
    return this.db.prepare(`SELECT * FROM runs WHERE group_name='verify' AND notes LIKE ? AND status='ok'`).all(`parent:${parentRunId}%`) as RunRow[]
  }

  // Median score across verify seeds, per example, for a given parent config.
  // Returns null if no verify rows exist for this parent.
  verifyMedianSum(parentRunId: number): number | null {
    const rows = this.verifyRowsFor(parentRunId)
    if (!rows.length) return null
    const byExample = new Map<string, number[]>()
    for (const r of rows) {
      if (r.score_default == null) continue
      const arr = byExample.get(r.example) ?? []
      arr.push(r.score_default)
      byExample.set(r.example, arr)
    }
    let sum = 0
    for (const scores of byExample.values()) {
      scores.sort((a, b) => a - b)
      const mid = Math.floor(scores.length / 2)
      sum += scores.length % 2 === 0 ? (scores[mid - 1]! + scores[mid]!) / 2 : scores[mid]!
    }
    return sum
  }

  counts(): { group: string; example: string; ok: number; err: number; total: number }[] {
    return this.db
      .prepare(
        `SELECT group_name AS \`group\`, example,
           SUM(status='ok') AS ok,
           SUM(status='error' OR status='timeout') AS err,
           COUNT(*) AS total
         FROM runs GROUP BY group_name, example
         ORDER BY group_name, example`,
      )
      .all() as { group: string; example: string; ok: number; err: number; total: number }[]
  }
}

export function openDb(path: string): BenchDb {
  return new BenchDb(path)
}
