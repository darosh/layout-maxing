#!/usr/bin/env -S deno run -A --sloppy-imports
// Bench CLI entrypoint.
//
// Subcommands:
//   run     [--phase baseline|preset|oat|synergy|gapfill]
//           [--group stagnation|niching|cluster|mutweights|fitness]
//           [--example example-N] [--limit N] [--db PATH]
//   status
//   show    [--port 8787]
//   export  --run <id> | --top --example <name> [--limit N]
//   summary [--group <g>] [--example <name>]

import { cpus } from 'node:os'
import { dirname, fromFileUrl, resolve } from 'jsr:@std/path'
import { openDb } from './db.ts'
import { computeWorkItem, executeWorkItem } from './runner.ts'
import { genBaseline, genPresets, genOAT, genSynergy, genGapfill, genVerify, type WorkItem } from './sampler.ts'
import { findGroup, GROUPS } from './groups.ts'
import { exportRunConfig, statusText, summaryMarkdown, topRows } from './summary.ts'
import { savePresets } from './save-presets.ts'

function parseArgs(argv: string[]): { sub: string; flags: Map<string, string | true>; positional: string[] } {
  const sub = argv[0] ?? 'help'
  const flags = new Map<string, string | true>()
  const positional: string[] = []
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const k = a.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags.set(k, next)
        i++
      } else {
        flags.set(k, true)
      }
    } else positional.push(a)
  }
  return { sub, flags, positional }
}

function defaultDbPath(): string {
  const here = dirname(fromFileUrl(import.meta.url))
  return resolve(here, '..', 'bench.db')
}

async function gitSha(): Promise<string> {
  try {
    const p = new Deno.Command('git', { args: ['rev-parse', '--short', 'HEAD'], stdout: 'piped' })
    const out = await p.output()
    return new TextDecoder().decode(out.stdout).trim() || 'unknown'
  } catch {
    return 'unknown'
  }
}

function help() {
  console.log(`layout-maxing-bench

  run     [--phase baseline|preset|oat|synergy|gapfill] [--group <g>] [--example <e>] [--limit N] [--parallel N] [--workers N] [--db PATH]
  status  [--db PATH]
  show    [--port 8787] [--db PATH]
  export  --run <id> | --top --example <name> [--limit N] [--db PATH]
  summary [--group <g>] [--example <name>] [--db PATH]
  verify  [--top N=10] [--seeds N=5] [--example e] [--parallel N] [--workers N]  # re-run top-N configs × N seeds for stability
  save-presets                                       # write Best + BestStable + BestClustered + BestStableCluster

Groups: ${GROUPS.map((g) => g.name).join(', ')}
`)
}

function* chainGens(...gens: Generator<WorkItem>[]): Generator<WorkItem> {
  for (const g of gens) for (const x of g) yield x
}

async function runPhase(args: ReturnType<typeof parseArgs>) {
  const phase = (args.flags.get('phase') as string) ?? 'all'
  const groupFilter = args.flags.get('group') as string | undefined
  const exampleFilter = args.flags.get('example') as string | undefined
  const limit = Number(args.flags.get('limit') ?? '0') || Infinity
  const dbPath = (args.flags.get('db') as string) ?? defaultDbPath()
  const maxPerGroup = Number(args.flags.get('per-group') ?? '200')
  const gapfillCount = Number(args.flags.get('count') ?? '500')

  const parallel = Math.max(1, Number(args.flags.get('parallel') ?? '1'))
  const workersFlag = args.flags.get('workers')
  const workerCount = workersFlag ? Math.max(1, Number(workersFlag)) : Math.max(1, Math.floor(cpus().length / parallel))

  const db = openDb(dbPath)
  const sha = await gitSha()

  function gapfillGenAll(): Generator<WorkItem> {
    const parts: Generator<WorkItem>[] = []
    for (const g of GROUPS) {
      const exs = g.clusteredOnly ? ['example-5'] : ['example-1', 'example-2', 'example-3', 'example-4']
      for (const ex of exs) {
        const offset = db.nextSampleSeed('gapfill', ex)
        parts.push(genGapfill(g.name, offset, gapfillCount))
      }
    }
    return chainGens(...parts)
  }

  let gen: Generator<WorkItem>
  if (phase === 'baseline') gen = genBaseline()
  else if (phase === 'preset') gen = genPresets()
  else if (phase === 'oat') gen = genOAT()
  else if (phase === 'synergy') gen = genSynergy(groupFilter, maxPerGroup)
  else if (phase === 'gapfill') {
    if (groupFilter) {
      if (!findGroup(groupFilter)) {
        console.error(`unknown group: ${groupFilter}`)
        Deno.exit(1)
      }
      const ex = exampleFilter ?? (findGroup(groupFilter)!.clusteredOnly ? 'example-5' : 'example-2')
      const offset = db.nextSampleSeed('gapfill', ex)
      gen = genGapfill(groupFilter as any, offset, gapfillCount)
    } else {
      gen = gapfillGenAll()
    }
  } else if (phase === 'all') {
    // baseline → preset → oat → synergy(all) → gapfill(all). Resume via hasSample skipping.
    gen = chainGens(genBaseline(), genPresets(), genOAT(), genSynergy(undefined, maxPerGroup), gapfillGenAll())
  } else {
    console.error(`unknown phase: ${phase}`)
    Deno.exit(1)
  }

  let processed = 0
  let skipped = 0
  const active = new Set<Promise<void>>()

  const flush = async () => {
    if (active.size >= parallel) await Promise.race(active)
  }

  for (const item of gen) {
    if (exampleFilter && item.example.name !== exampleFilter) continue
    if (groupFilter && phase === 'all' && item.group !== groupFilter && item.group !== 'baseline' && item.group !== 'preset') continue
    if (processed >= limit) break

    // Resume: skip rows already in db with same (group, example, sample_seed).
    if (db.hasSample(item.group as any, item.example.name, item.sampleSeed)) {
      skipped++
      continue
    }

    const tag = `[${phase}${groupFilter ? '/' + groupFilter : ''}]`
    const label = `${tag} ${item.group} ${item.example.name} sample=${item.sampleSeed}${item.preset ? ' preset=' + item.preset : ''}`
    if (skipped > 0) {
      console.log(`  (resumed: skipped ${skipped} already-done rows)`)
      skipped = 0
    }
    console.log(`${label}  start`)

    await flush()
    const p: Promise<void> = (async () => {
      const c = await computeWorkItem(sha, item, workerCount)
      // DB write on the main thread — synchronous, naturally serialized
      const runId = db.insertRun(c.row, c.paramValues)
      console.log(
        `${label}  done  status=${c.status}  ` +
          `score_d=${c.scoreDefault?.toFixed(0) ?? '—'}  ` +
          `score_c=${c.scoreCustom?.toFixed(0) ?? '—'}  ` +
          `wall=${(c.wallMs / 1000).toFixed(1)}s  ` +
          `run=#${runId}`,
      )
    })()
    active.add(p)
    p.finally(() => active.delete(p))
    processed++
  }
  if (skipped > 0) console.log(`  (skipped ${skipped} already-done rows; nothing new to run)`)
  await Promise.all(active)
  db.close()
}

async function main() {
  const args = parseArgs(Deno.args)
  const dbPath = (args.flags.get('db') as string) ?? defaultDbPath()
  switch (args.sub) {
    case 'run':
      await runPhase(args)
      break
    case 'status': {
      const db = openDb(dbPath)
      console.log(statusText(db))
      db.close()
      break
    }
    case 'summary': {
      const db = openDb(dbPath)
      console.log(summaryMarkdown(db, args.flags.get('group') as string | undefined, args.flags.get('example') as string | undefined))
      db.close()
      break
    }
    case 'export': {
      const db = openDb(dbPath)
      const runFlag = args.flags.get('run')
      if (typeof runFlag === 'string') {
        console.log(exportRunConfig(db, Number(runFlag)))
      } else if (args.flags.get('top') === true) {
        const example = args.flags.get('example') as string
        if (!example) {
          console.error('--top requires --example')
          Deno.exit(1)
        }
        const limit = Number(args.flags.get('limit') ?? '10')
        for (const r of topRows(db, example, limit)) {
          console.log(`#${r.id}\t${r.score_default}\t${r.group_name}\t${r.preset ?? ''}`)
        }
      } else {
        console.error('export needs --run <id> or --top --example <name>')
      }
      db.close()
      break
    }
    case 'verify': {
      const db = openDb(dbPath)
      const sha = await gitSha()
      const k = Number(args.flags.get('top') ?? '10')
      const seeds = Number(args.flags.get('seeds') ?? '5')
      const exFilter = args.flags.get('example') as string | undefined
      const vParallel = Math.max(1, Number(args.flags.get('parallel') ?? '1'))
      const vWorkersFlag = args.flags.get('workers')
      const vWorkerCount = vWorkersFlag ? Math.max(1, Number(vWorkersFlag)) : Math.max(1, Math.floor(cpus().length / vParallel))
      // Build candidates for ex1-4.
      const cands = db.topCandidates(k).map((c) => {
        const row = db.getRun(c.run_id)!
        return {
          runId: c.run_id,
          configJson: row.config_json,
          examples: exFilter ? [exFilter] : ['example-1', 'example-2', 'example-3', 'example-4'],
        }
      })
      // Also add top ex5 candidates.
      const cands5 = db.topCandidatesEx5(Math.ceil(k / 2)).map((c) => {
        const row = db.getRun(c.run_id)!
        return { runId: c.run_id, configJson: row.config_json, examples: exFilter ? [exFilter] : ['example-5'] }
      })
      const allCands = [...cands, ...cands5]
      if (!allCands.length) {
        console.log('no candidates yet — run the sweep first')
        db.close()
        break
      }
      console.log(`verify: ${allCands.length} candidates × ${seeds} seeds each (parallel=${vParallel})`)
      let count = 0
      const vActive = new Set<Promise<void>>()
      const vFlush = async () => {
        if (vActive.size >= vParallel) await Promise.race(vActive)
      }
      for (const item of genVerify(allCands, seeds, db)) {
        const label = `[verify] run=#${item.paramValues.__parentRunId} ${item.example.name} seed_i=${item.paramValues.__seedIndex}`
        console.log(`${label}  start`)
        await vFlush()
        const p: Promise<void> = (async () => {
          const res = await executeWorkItem(db, sha, { ...item, notes: `parent:${item.paramValues.__parentRunId}` } as any, vWorkerCount)
          console.log(
            `${label}  done  status=${res.status}  score_d=${res.scoreDefault?.toFixed(0) ?? '—'}  wall=${(res.wallMs / 1000).toFixed(1)}s  run=#${res.runId}`,
          )
          count++
        })()
        vActive.add(p)
        p.finally(() => vActive.delete(p))
      }
      await Promise.all(vActive)
      console.log(`verify complete: ${count} rows written`)
      db.close()
      break
    }
    case 'save-presets': {
      const db = openDb(dbPath)
      const res = await savePresets(db)
      if (res.best) console.log(`wrote presets/best.ts (run #${res.best.runId}, ex1-4 sum=${res.best.sum.toFixed(0)})`)
      else console.log('no shared ex1-4 config available yet — skipped best.ts')
      if (res.bestStable)
        console.log(
          `wrote presets/best-stable.ts (run #${res.bestStable.runId}, median sum=${res.bestStable.medianSum.toFixed(0)}, seeds=${res.bestStable.seeds})`,
        )
      else console.log('no verify data for ex1-4 yet — skipped best-stable.ts')
      if (res.bestClustered) console.log(`wrote presets/best-clustered.ts (run #${res.bestClustered.runId}, ex5 score=${res.bestClustered.score.toFixed(0)})`)
      else console.log('no ex5 config available yet — skipped best-clustered.ts')
      if (res.bestStableCluster)
        console.log(
          `wrote presets/best-stable-cluster.ts (run #${res.bestStableCluster.runId}, median score=${res.bestStableCluster.medianScore.toFixed(0)}, seeds=${res.bestStableCluster.seeds})`,
        )
      else console.log('no verify data for ex5 yet — skipped best-stable-cluster.ts')
      db.close()
      break
    }
    case 'show': {
      const { startServer } = await import('./web/server.ts')
      await startServer(dbPath, Number(args.flags.get('port') ?? '8787'))
      break
    }
    case 'help':
    default:
      help()
  }
}

if (import.meta.main) void main()
