// `save-presets`: writes Best (for ex1-4) and BestCluster (for ex5) preset files
// based on the current bench.db, then patches packages/layout-maxing/src/presets/index.ts
// to register them. Idempotent — re-running overwrites the preset files in place.

import { defaultConfig, configMeta } from 'layout-maxing'
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
// Rounds numeric values to the step precision defined in configMeta.
function deltaFromDefault(resolved: Required<Config>): Partial<Config> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(resolved)) {
    let snapped = v
    if (typeof v === 'number') {
      const step = (configMeta as Record<string, [unknown, unknown, unknown, number | null, unknown]>)[k]?.[3] ?? null
      if (step && step > 0) {
        const decimals = Math.max(0, Math.ceil(-Math.log10(step)))
        snapped = Number((Math.round(v / step) * step).toFixed(decimals))
      }
    }
    if ((defaultConfig as Record<string, unknown>)[k] !== snapped) out[k] = snapped
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

async function patchIndex(flags: { best: boolean; bestCluster: boolean; bestStable: boolean; bestStableCluster: boolean }) {
  const indexPath = resolve(PRESETS_DIR, 'index.ts')
  let text = await Deno.readTextFile(indexPath)

  function addImport(existing: string, after: string, newLine: string): string {
    return text.includes(newLine) ? text : text.replace(after, `${after}\n${newLine}`)
  }
  function addExport(existing: string, after: string, newEntry: string): string {
    return text.includes(newEntry + ',') ? text : text.replace(after, `${after}${newEntry},`)
  }

  if (flags.best) {
    text = addImport(text, "import Default from './default.ts'", "import Best from './best.ts'")
    text = addExport(text, '  Default,\n', '  Best,\n')
  }
  if (flags.bestStable) {
    text = addImport(text, "import Best from './best.ts'", "import BestStable from './best-stable.ts'")
    text = addExport(text, '  Best,\n', '  BestStable,\n')
  }
  if (flags.bestCluster) {
    text = addImport(text, "import Clustered from './clustered.ts'", "import BestCluster from './best-cluster.ts'")
    text = addExport(text, '  Clustered,\n', '  BestCluster,\n')
  }
  if (flags.bestStableCluster) {
    text = addImport(text, "import BestCluster from './best-cluster.ts'", "import BestStableCluster from './best-stable-cluster.ts'")
    text = addExport(text, '  BestCluster,\n', '  BestStableCluster,\n')
  }
  await Deno.writeTextFile(indexPath, text)
}

function median(scores: number[]): number {
  const s = [...scores].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[m - 1]! + s[m]!) / 2 : s[m]!
}

export async function savePresets(db: BenchDb): Promise<{
  best?: { runId: number; sum: number }
  bestStable?: { runId: number; medianSum: number; seeds: number }
  bestCluster?: { runId: number; score: number }
  bestStableCluster?: { runId: number; medianScore: number; seeds: number }
}> {
  const result: {
    best?: { runId: number; sum: number }
    bestStable?: { runId: number; medianSum: number; seeds: number }
    bestCluster?: { runId: number; score: number }
    bestStableCluster?: { runId: number; medianScore: number; seeds: number }
  } = {}

  // ---- Best (single-seed winner, ex1-4) ----
  const sharedRow = bestSharedEx1to4(db)
  if (sharedRow) {
    const resolved = JSON.parse(sharedRow.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    const all = (db as any).db
      .prepare(`SELECT example, score_default FROM runs WHERE group_name=? AND sample_seed=? AND example LIKE 'example-%'`)
      .all(sharedRow.group_name, sharedRow.sample_seed) as { example: string; score_default: number }[]
    const sum = all.reduce((a, b) => a + (b.score_default ?? 0), 0)
    const header = [
      `Best preset — auto-generated by layout-maxing-bench.`,
      `// Source: group="${sharedRow.group_name}" sample_seed=${sharedRow.sample_seed} run=#${sharedRow.id}`,
      `// Single-seed scores: ${all.map((r) => `${r.example}=${r.score_default.toFixed(0)}`).join(', ')}`,
      `// Sum = ${sum.toFixed(0)}  (run \`deno task verify\` then \`deno task save-presets\` for BestStable)`,
    ].join('\n// ')
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best.ts'), renderPreset('Best', delta, header))
    result.best = { runId: sharedRow.id, sum }
  }

  // ---- BestStable (median across verify seeds, ex1-4) ----
  const candidates = db.topCandidates(20)
  let bestStableRunId: number | null = null
  let bestStableMedianSum = Infinity
  let bestStableSeeds = 0
  for (const cand of candidates) {
    const ms = db.verifyMedianSum(cand.run_id)
    if (ms != null && ms < bestStableMedianSum) {
      bestStableMedianSum = ms
      bestStableRunId = cand.run_id
      bestStableSeeds = db.verifyRowsFor(cand.run_id).length
    }
  }
  if (bestStableRunId != null) {
    const row = db.getRun(bestStableRunId)!
    const resolved = JSON.parse(row.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    // Remove seed from BestStable — it's stable across seeds, so don't pin one.
    delete (delta as Record<string, unknown>).seed
    const verRows = db.verifyRowsFor(bestStableRunId)
    const byEx = new Map<string, number[]>()
    for (const r of verRows) {
      if (r.score_default == null) continue
      const arr = byEx.get(r.example) ?? []
      arr.push(r.score_default)
      byEx.set(r.example, arr)
    }
    const exSummary = [...byEx.entries()].map(([ex, sc]) => `${ex}=~${median(sc).toFixed(0)}`).join(', ')
    const header = [
      `BestStable preset — auto-generated by layout-maxing-bench.`,
      `// Source: run=#${bestStableRunId} verified across ${bestStableSeeds} seed×example rows`,
      `// Median scores: ${exSummary}`,
      `// Median sum = ${bestStableMedianSum.toFixed(0)}  (seed omitted — stable across seeds)`,
    ].join('\n// ')
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best-stable.ts'), renderPreset('BestStable', delta, header))
    result.bestStable = { runId: bestStableRunId, medianSum: bestStableMedianSum, seeds: bestStableSeeds }
  }

  // ---- BestCluster (single-seed, ex5) ----
  const ex5Row = bestEx5(db)
  if (ex5Row) {
    const resolved = JSON.parse(ex5Row.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    const header = [
      `BestCluster preset — auto-generated by layout-maxing-bench.`,
      `// Source: run=#${ex5Row.id} group="${ex5Row.group_name}"${ex5Row.preset ? ` preset="${ex5Row.preset}"` : ''}`,
      `// example-5 score: ${ex5Row.score_default?.toFixed(0)}`,
    ].join('\n// ')
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best-cluster.ts'), renderPreset('BestCluster', delta, header))
    result.bestCluster = { runId: ex5Row.id, score: ex5Row.score_default ?? Infinity }
  }

  // ---- BestStableCluster (median across verify seeds, ex5) ----
  const ex5Candidates = db.topCandidatesEx5(10)
  let bestStableClusterRunId: number | null = null
  let bestStableClusterMedian = Infinity
  let bestStableClusterSeeds = 0
  for (const cand of ex5Candidates) {
    const rows = db.verifyRowsFor(cand.run_id).filter((r) => r.example === 'example-5' && r.score_default != null)
    if (!rows.length) continue
    const med = median(rows.map((r) => r.score_default!))
    if (med < bestStableClusterMedian) {
      bestStableClusterMedian = med
      bestStableClusterRunId = cand.run_id
      bestStableClusterSeeds = rows.length
    }
  }
  if (bestStableClusterRunId != null) {
    const row = db.getRun(bestStableClusterRunId)!
    const resolved = JSON.parse(row.config_json) as Required<Config>
    const delta = deltaFromDefault(resolved)
    delete (delta as Record<string, unknown>).seed
    const header = [
      `BestStableCluster preset — auto-generated by layout-maxing-bench.`,
      `// Source: run=#${bestStableClusterRunId} verified across ${bestStableClusterSeeds} seeds on example-5`,
      `// Median score: ${bestStableClusterMedian.toFixed(0)}  (seed omitted — stable across seeds)`,
    ].join('\n// ')
    await Deno.writeTextFile(resolve(PRESETS_DIR, 'best-stable-cluster.ts'), renderPreset('BestStableCluster', delta, header))
    result.bestStableCluster = { runId: bestStableClusterRunId, medianScore: bestStableClusterMedian, seeds: bestStableClusterSeeds }
  }

  await patchIndex({
    best: !!result.best,
    bestCluster: !!result.bestCluster,
    bestStable: !!result.bestStable,
    bestStableCluster: !!result.bestStableCluster,
  })
  return result
}
