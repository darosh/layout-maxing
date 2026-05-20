// Execute one (config, example) row: spin up workers, call main(), capture monitor,
// dual-score the result with both the run config and defaultConfig, write to db.

import { defaultConfig, fitness, main } from 'layout-maxing'
import type { Box, Config, Line, RNBO, RunMonitor } from 'layout-maxing'
import Worker from 'web-worker'
import { openDb, type BenchDb } from './db.ts'
import { makePool } from './workers.ts'
import { resolveConfig, type WorkItem } from './sampler.ts'

const FIFTEEN_MIN_MS = 15 * 60 * 1000

export interface RunResult {
  runId: number
  status: 'ok' | 'error'
  wallMs: number
  scoreCustom: number | null
  scoreDefault: number | null
}

function elkWorkerFactory() {
  return new Worker(import.meta.resolve('elkjs/lib/elk-worker.min.js'), { type: 'module' })
}

async function readRnbo(path: string): Promise<RNBO> {
  const text = await Deno.readTextFile(path)
  const parsed = JSON.parse(text)
  return 'patcher' in parsed ? parsed : { patcher: parsed }
}

export async function executeWorkItem(db: BenchDb, gitSha: string, item: WorkItem): Promise<RunResult> {
  const resolved = resolveConfig(item)
  const rnbo = await readRnbo(item.example.file)
  const lines: Line[] = rnbo.patcher.lines ?? []

  const pool = makePool(resolved.workers ?? 0)
  pool.init(resolved)

  let monitor: RunMonitor | undefined
  const start = Date.now()
  const warnTimer = setInterval(() => {
    const elapsedMin = Math.floor((Date.now() - start) / 60000)
    console.warn(`WARN  ${item.group}/${item.example.name} sample=${item.sampleSeed} still running after ${elapsedMin}m`)
  }, FIFTEEN_MIN_MS)

  let status: 'ok' | 'error' = 'ok'
  let errMsg: string | null = null
  let best: Box[] = []
  try {
    best = await main(
      rnbo,
      pool.getFitness,
      undefined, // onIntermediate
      resolved,
      undefined, // onGenerationEnd
      undefined, // logProgress
      undefined, // logInfo
      (m) => {
        monitor = m
      },
      elkWorkerFactory,
      undefined,
    )
  } catch (e) {
    status = 'error'
    errMsg = (e as Error).message || String(e)
  } finally {
    clearInterval(warnTimer)
    pool.terminate()
  }

  const wallMs = Date.now() - start

  let scoreCustom: number | null = null
  let scoreDefault: number | null = null
  let metrics = {
    crossings: null as number | null,
    overlaps: null as number | null,
    collisions: null as number | null,
    area: null as number | null,
    view: null as number | null,
    length: null as number | null,
    misalignedSS: null as number | null,
  }
  if (status === 'ok' && best.length > 0) {
    const fCustom = fitness(best, lines, resolved)
    const fDefault = fitness(best, lines, { ...defaultConfig })
    scoreCustom = fCustom.score
    scoreDefault = fDefault.score
    metrics = {
      crossings: fDefault.crossings,
      overlaps: fDefault.overlaps,
      collisions: fDefault.collisions,
      area: fDefault.area,
      view: fDefault.view,
      length: fDefault.length,
      misalignedSS: fDefault.misalignedSS,
    }
  }

  // Cost accounting from monitor snapshots. Each snapshot is one generation × popSize evals.
  // For cluster phase, snapshot.cluster.index < total indicates per-cluster work; index == total marks polish.
  let evalsMain = 0
  let evalsCluster = 0
  let genActual = 0
  if (monitor?.snapshots) {
    genActual = monitor.snapshots.length
    for (const s of monitor.snapshots) {
      const evals = resolved.popSize
      if (s.cluster && s.cluster.index < s.cluster.total) evalsCluster += evals
      else evalsMain += evals
    }
  }
  const evalsTotal = evalsMain + evalsCluster

  const runId = db.insertRun(
    {
      created_at: new Date().toISOString(),
      git_sha: gitSha,
      example: item.example.name,
      preset: item.preset,
      group_name: item.group as any,
      sample_seed: item.sampleSeed,
      ga_seed: item.gaSeed,
      config_json: JSON.stringify(resolved),
      status,
      error: errMsg,
      evals_total: evalsTotal || null,
      evals_main: evalsMain || null,
      evals_cluster: evalsCluster || null,
      generations_actual: genActual || null,
      wall_ms: wallMs,
      score_custom: scoreCustom,
      score_default: scoreDefault,
      crossings: metrics.crossings,
      overlaps: metrics.overlaps,
      collisions: metrics.collisions,
      area: metrics.area,
      view: metrics.view,
      total_dist: metrics.length,
      misaligned_ss: metrics.misalignedSS,
      notes: null,
    },
    item.paramValues,
  )

  return { runId, status, wallMs, scoreCustom, scoreDefault }
}
