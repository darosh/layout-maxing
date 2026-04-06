import { type Config, defaultConfig } from './config.ts'
import {
  type BoxLayout,
  type Line,
  type Patcher,
  createInitialLayouts,
  fillDepths,
  dagreFlow,
  simpleFlow,
} from './layout.ts'
import { cloneLayouts } from './mutation.ts'
import { type Fitness, fitness } from './fitness.ts'
import runGenetic from './genetic.ts'

type BoxId = string

export interface RNBO {
  patcher: Patcher
}

// Deterministic random (Mulberry32 - fixed seed guarantees identical runs)
function createDeterministicRandom(seed: number = 123456789): () => number {
  let state = seed
  return () => {
    let t = (state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function applyBestLayout(rnbo: RNBO, best: BoxLayout[]) {
  const map = new Map(best.map((l) => [l.id, l]))
  for (const b of rnbo.patcher.boxes) {
    const data = b.box
    const layout = map.get(data.id as BoxId)
    if (layout) {
      data.patching_rect[0] = Math.round(layout.x)
      data.patching_rect[1] = Math.round(layout.y)
      // width/height unchanged
    }
  }
}

type FlatObject<T> = {
  [K in keyof T]?: string | number | boolean | null | undefined
}

export function jsonDiff<T>(defaults: FlatObject<T>, tgt: FlatObject<T>): FlatObject<T> {
  const result: FlatObject = {}

  for (const key in tgt) {
    if (tgt[key] !== defaults[key]) {
      result[key] = tgt[key]
    }
  }

  return result
}

export async function main(
  rnbo: RNBO,
  getFitness?: (layouts: BoxLayout[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
  onIntermediate?: (layouts: BoxLayout[]) => void,
  cfg?: Config,
  onGenerationEnd?: (stop: number) => void,
  logProgress?: (...args) => void,
  logInfo?: (...args) => void,
) {
  if (logInfo) {
    logInfo(`Configuration\n${JSON.stringify(jsonDiff<Config>(defaultConfig, cfg))}`)
  }

  const c = { ...defaultConfig, ...cfg }
  const rand = c.deterministic ? createDeterministicRandom() : Math.random

  const patcher = rnbo.patcher
  const lines = patcher.lines

  // Build initial layouts
  const baseLayouts = createInitialLayouts(patcher)
  const inputFitness = getFitness
    ? await getFitness(baseLayouts, lines, c)
    : fitness(baseLayouts, lines, c)

  if (logInfo)
    logInfo(
      `Input fitness ${inputFitness.score.toFixed(0)}\n${JSON.stringify(inputFitness, null, 2)}`,
    )
  fillDepths(baseLayouts, lines)

  let startingLayouts: BoxLayout[][]

  if (c.useDagre) {
    startingLayouts = (['TB' /*'LR', 'BT', 'RL'*/] as const).map((dir) => {
      const clone = cloneLayouts(baseLayouts)
      dagreFlow(clone, lines, dir)
      return clone
    })
  } else {
    simpleFlow(baseLayouts, c)
    startingLayouts = [baseLayouts]
  }

  if (c.useInput) {
    startingLayouts = [cloneLayouts(baseLayouts), ...startingLayouts]
  }

  const bestIndividual = await runGenetic(
    startingLayouts,
    lines,
    rand,
    c,
    getFitness,
    onIntermediate,
    onGenerationEnd,
    logProgress,
    logInfo,
  )

  // Apply best positions back to original RNBO structure
  applyBestLayout(rnbo, bestIndividual)
}
