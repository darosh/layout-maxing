import { type Config, defaultConfig } from './config.ts'
import {
  type Box,
  type Line,
  type Patcher,
  createInitialLayouts,
  fillDepths,
  dagreFlow,
  simpleFlow,
  normalizeLayouts,
  stripOrphans,
  preserveGroupMembers,
  stampGroupIdx,
  stampGroupOffsets,
} from './layout.ts'
import { cloneLayouts } from './mutation.ts'
import { type Fitness, fitness } from './fitness.ts'
import runGenetic from './genetic.ts'
import type { RunMonitor, GenerationSnapshot } from './monitor.ts'

type BoxId = string

export interface RNBO {
  patcher: Patcher
  best?: number
}

// Deterministic random (Mulberry32 - fixed seed guarantees identical runs)
function createDeterministicRandom(seed: number): () => number {
  let state = seed
  return () => {
    let t = (state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function applyBestLayout(rnbo: RNBO, best: Box[], cfg: Required<Config>) {
  let working = best
  if (cfg.normalizeExport) {
    working = best.map((l) => ({ ...l }))
    normalizeLayouts(working)
  }
  const map = new Map(working.map((l) => [l.id, l]))
  for (const b of rnbo.patcher.boxes) {
    const data = b.box
    const layout = map.get(data.id as BoxId)
    if (!layout) continue // orphan stripped upstream, or unknown — skip
    data.patching_rect[0] = Math.round(layout.x)
    data.patching_rect[1] = Math.round(layout.y)
    // width/height unchanged
  }
  if (cfg.removeLineSegments) {
    for (const line of rnbo.patcher.lines ?? []) {
      delete line.patchline.midpoints
    }
  }
}

type FlatObject<T> = {
  [K in keyof T]?: string | number | boolean | null | undefined
}

export function jsonDiff<T>(defaults: FlatObject<T>, tgt: FlatObject<T>): FlatObject<T> {
  const result: FlatObject<T> = {}

  for (const key in tgt) {
    if (tgt[key] !== defaults[key]) {
      result[key] = tgt[key]
    }
  }

  return result
}

export async function main(
  rnbo: RNBO,
  getFitness?: (layouts: Box[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
  onIntermediate?: (layouts: Box[]) => void,
  cfg?: Config,
  onGenerationEnd?: (
    stop: number,
    snapshot?: GenerationSnapshot,
    passNum?: number,
    numPasses?: number,
  ) => void,
  logProgress?: (...args: any) => void,
  logInfo?: (...args: any) => void,
  onMonitorEnd?: (monitor: RunMonitor) => void,
) {
  if (logInfo && cfg) {
    logInfo(`Configuration\n${JSON.stringify(jsonDiff<Config>(defaultConfig, cfg))}`)
  }

  const c = { ...defaultConfig, ...cfg }
  const patcher = rnbo.patcher
  const lines = patcher.lines ?? []

  // Build initial layouts
  let baseLayouts = createInitialLayouts(patcher)
  // Stamp groupIdx and original offsets before any layout algorithm moves boxes.
  // stampGroupOffsets must come before dagreFlow so _groupDx/_groupDy reflect the
  // original patcher positions, which are the ones the test (and user) expects preserved.
  if (c.keepGroups) {
    stampGroupIdx(baseLayouts, patcher.boxgroups)
    stampGroupOffsets(baseLayouts, patcher.boxgroups)
  }
  const inputFitness = getFitness
    ? await getFitness(baseLayouts, lines, c)
    : fitness(baseLayouts, lines, c)

  if (logInfo)
    logInfo(
      `Input fitness ${inputFitness.score.toFixed(0)}\n${JSON.stringify(inputFitness, null, 2)}`,
    )
  fillDepths(baseLayouts, lines)

  if (c.ignoreOrphans) {
    if (c.keepGroups) preserveGroupMembers(baseLayouts, patcher.boxgroups)
    baseLayouts = stripOrphans(baseLayouts)
    // Re-run depth/parent/children resolution: stripOrphans re-numbers
    // .index, so the cached parents/children arrays from the first
    // fillDepths pass would now point to the wrong boxes.
    fillDepths(baseLayouts, lines)
  }

  let startingLayouts: Box[][] = []

  if (c.useDagre) {
    startingLayouts.push(
      ...(['TB' /*'LR', 'BT', 'RL'*/] as const).map((dir) => {
        const clone = cloneLayouts(baseLayouts)
        dagreFlow(clone, lines, dir)
        return clone
      }),
    )
  }

  if (c.useSimpleFlow) {
    const clone = cloneLayouts(baseLayouts)
    simpleFlow(clone, c)
    startingLayouts.push(clone)
  }

  if (c.useInput || !startingLayouts.length) {
    const clone = cloneLayouts(baseLayouts)
    startingLayouts.push(clone)
  }

  // Normalize starting layouts so they satisfy the same invariants the GA enforces each generation.
  for (const sl of startingLayouts) {
    if (c.normalize) normalizeLayouts(sl)
  }

  if (lines.length === 0 && logInfo) {
    logInfo('No lines!')
  }

  const numPasses = c.passes

  let globalBest: Box[] = []
  let globalBestScore = Infinity

  for (let pass = 0; pass < numPasses; pass++) {
    const passNum = pass + 1
    const rand = c.deterministic ? createDeterministicRandom(c.seed + pass) : Math.random

    const wrappedLogProgress =
      numPasses > 1 && logProgress
        ? (...args: any[]) =>
            logProgress(`PASS: ${passNum}/${numPasses} | ` + args[0], ...args.slice(1))
        : logProgress

    const wrappedOnGenerationEnd = onGenerationEnd
      ? (stop: number, snapshot?: GenerationSnapshot) =>
          onGenerationEnd(stop, snapshot, passNum, numPasses)
      : undefined

    const result = await runGenetic(
      startingLayouts,
      lines,
      rand,
      c,
      getFitness,
      onIntermediate,
      wrappedOnGenerationEnd,
      wrappedLogProgress,
      logInfo,
      onMonitorEnd,
    )

    if (result.length > 0) {
      const resultFitness = getFitness
        ? await getFitness(result, lines, c)
        : fitness(result, lines, c)
      if (resultFitness.score < globalBestScore) {
        globalBestScore = resultFitness.score
        globalBest = result
      }
    }
  }

  return globalBest
}
