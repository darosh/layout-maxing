// `save-presets`: writes Best (for ex1-4) and BestCluster (for ex5) preset files
// based on the current bench.db, then patches packages/layout-maxing/src/presets/index.ts
// to register them. Idempotent — re-running overwrites the preset files in place.

import { defaultConfig } from 'layout-maxing'
import type { Config } from 'layout-maxing'
import { dirname, fromFileUrl, resolve } from 'jsr:@std/path'
import type { BenchDb, RunRow } from './db.ts'

const PRESETS_DIR = resolve(dirname(fromFileUrl(import.meta.url)), '..', '..', 'layout-maxing', 'src', 'presets')

// Pick best (config, example) row for ex5 by score_default.
function bestEx5(db: BenchDb): RunRow | undefined {
  const rows = (db as any).db.prepare(`SELECT * FROM runs WHERE example='example-5' AND status='ok' ORDER BY score_default LIMIT 1`).get() as RunRow | undefined
  return rows
}

// Pick the (group, sample_seed) whose 4 ex1-4 runs sum to the smallest score_default.
// Returns one representative row (any of the 4 — config_json is identical for them).
function bestSharedEx1to4(db: BenchDb): RunRow | undefined {
  const row = (db as any).db
    .prepare(
      `SELECT group_name, sample_seed FROM runs
     WHERE status='ok'
       AND example IN ('example-1','example-2','example-3','example-4')
       AND group_name NOT IN ('baseline','preset')
     GROUP BY group_name, sample_seed
     HAVING COUNT(*)=4
     ORDER BY SUM(score_default) ASC
     LIMIT 1`,
    )
    .get() as { group_name: string; sample_seed: number } | undefined
  if (!row) return undefined
  return (db as any).db
    .prepare(`SELECT * FROM runs WHERE group_name=? AND sample_seed=? AND example='example-1' LIMIT 1`)
    .get(row.group_name, row.sample_seed) as RunRow | undefined
}

// Diff resolved config against defaultConfig — preset file should be minimal.
function deltaFromDefault(resolved: Required<Config>): Partial<Config> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(resolved)) {
    if ((defaultConfig as Record<string, unknown>)[k] !== v) out[k] = v
  }
  return out as Partial<Config>
}

function renderPreset(name: string, delta: Partial<Config>, header: string): string {
  const lines = ["import type { Config } from '../config.ts'", '', `// ${header}`, 'export default {']
  // Preferred ordering: GA core → niching → clustering → mutweights → fitness → rest
  const order = [
    'popSize',
    'stop',
    'generations',
    'passes',
    'mutationRate',
    'crossoverRate',
    'tournamentSize',
    'eliteSize',
    'nichingEnabled',
    'nichingRadius',
    'nichingExponent',
    'stagnationThreshold',
    'stagnationRate',
    'diversityBoost',
    'diversityBoostCap',
    'diversityBoostFactor',
    'cluster',
    'clusterMax',
    'clusterPolishFraction',
    'clusterPolishMutate',
    'saEnabled',
    'initialMutation',
    'deterministic',
  ]
  const seen = new Set<string>()
  for (const k of order) {
    if (k in delta) {
      lines.push(`  ${k}: ${JSON.stringify((delta as Record<string, unknown>)[k])},`)
      seen.add(k)
    }
  }
  // `seed` is part of the config — keep it. Determinism is required for the saved
  // score to be reproducible. (A separate BestStable preset, planned later, will be
  // chosen by score stability across multiple seeds rather than a single run.)
  for (const [k, v] of Object.entries(delta)) {
    if (seen.has(k)) continue
    lines.push(`  ${k}: ${JSON.stringify(v)},`)
  }
  lines.push('} satisfies Config', '')
  void name
  return lines.join('\n')
}

async function patchIndex(addBest: boolean, addBestCluster: boolean) {
  const indexPath = resolve(PRESETS_DIR, 'index.ts')
  let text = await Deno.readTextFile(indexPath)
  if (addBest && !text.includes("from './best.ts'")) {
    text = text.replace(/import Default from '\.\/default\.ts'/, "import Default from './default.ts'\nimport Best from './best.ts'")
    text = text.replace(/(\s+)Default,/, `$1Default,$1Best,`)
  }
  if (addBestCluster && !text.includes("from './best-clustered.ts'")) {
    text = text.replace(/import Clustered from '\.\/clustered\.ts'/, "import Clustered from './clustered.ts'\nimport BestCluster from './best-clustered.ts'")
    text = text.replace(/(\s+)Clustered,/, `$1Clustered,$1BestCluster,`)
  }
  await Deno.writeTextFile(indexPath, text)
}

export async function savePresets(db: BenchDb): Promise<{ best?: { runId: number; sum: number }; bestCluster?: { runId: number; score: number } }> {
  const result: { best?: { runId: number; sum: number }; bestCluster?: { runId: number; score: number } } = {}

  const sharedRow = bestSharedEx1to4(db)
  if (sharedRow) {
    const resolved = JSON.parse(sharedRow.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    // Pull all 4 scores for header.
    const all = (db as any).db
      .prepare(`SELECT example, score_default FROM runs WHERE group_name=? AND sample_seed=? AND example LIKE 'example-%'`)
      .all(sharedRow.group_name, sharedRow.sample_seed) as { example: string; score_default: number }[]
    const sum = all.reduce((a, b) => a + (b.score_default ?? 0), 0)
    const header = `Best preset (auto-generated by layout-maxing-bench).\n// Sourced from bench group="${sharedRow.group_name}" sample_seed=${sharedRow.sample_seed}.\n// Scores: ${all.map((r) => `${r.example}=${r.score_default.toFixed(0)}`).join(', ')}\n// Sum across ex1-4 = ${sum.toFixed(0)} (lower is better).`
    const text = renderPreset('Best', delta, header)
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best.ts'), text)
    result.best = { runId: sharedRow.id, sum }
  }

  const ex5Row = bestEx5(db)
  if (ex5Row) {
    const resolved = JSON.parse(ex5Row.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    const header = `BestCluster preset (auto-generated by layout-maxing-bench).\n// Sourced from bench run #${ex5Row.id} (group="${ex5Row.group_name}"${ex5Row.preset ? `, preset="${ex5Row.preset}"` : ''}).\n// example-5 score: ${ex5Row.score_default?.toFixed(0)} (lower is better).`
    const text = renderPreset('BestCluster', delta, header)
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best-clustered.ts'), text)
    result.bestCluster = { runId: ex5Row.id, score: ex5Row.score_default ?? Infinity }
  }

  await patchIndex(!!result.best, !!result.bestCluster)
  return result
}
