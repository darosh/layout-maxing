import type { Config } from './config.ts'
import type { Box } from './layout.ts'

export type MutationStat = {
  attempts: number // times selected by roulette
  improvements: number // child fitness better than parent
  survived: number // child made it into elite slots of next gen
  totalDelta: number // sum of fitness deltas (signed; negative = improvement)
}

export type GenerationSnapshot = {
  gen: number
  best: number // best fitness score
  worst: number
  median: number
  p25: number
  p75: number
  diversity: number // 0–1, higher = more diverse
  stagnation: number // generations without improvement
  mutations: Record<string, MutationStat>
}

export type LineageEvent = {
  gen: number
  mutation: string // mutation type name
  boxId: string // which box was moved
  delta: number // fitness change (negative = improvement)
}

export type RunMonitor = {
  snapshots: GenerationSnapshot[]
  runTotals: Record<string, MutationStat> // aggregated across all generations
  bestLineage: LineageEvent[] // events that produced each new best individual
  deadWeightMutations: string[] // mutations with 0 representation in top-10% at end
}

export const MUTATION_NAMES = [
  'quadrant',
  'single',
  'children',
  'parents',
  'swapSibling',
  'swapRandom',
  'swapInRow',
  'swapInCol',
  'shiftRow',
  'shiftCol',
] as const

// Tuple: [label, shortcut, description]
export type MutationMetaEntry = [label: string, shortcut: string, description: string]

export const mutationMeta: Record<string, MutationMetaEntry> = {
  quadrant: ['Quadrant', 'QUAD', 'Move a box to a different quadrant of the canvas'],
  single: ['Single', 'SNGL', 'Nudge one box by a small random grid offset'],
  children: ['Children', 'CHLD', 'Relocate a box near one of its downstream children'],
  parents: ['Parents', 'PRNT', 'Relocate a box near one of its upstream parents'],
  swapSibling: ['Swap Sibling', 'SWSB', 'Swap positions with a box that shares a parent or child'],
  swapRandom: ['Swap Random', 'SWRN', 'Swap positions with any random box'],
  swapInRow: ['Swap In Row', 'SWRW', 'Swap positions with a box on the same grid row'],
  swapInCol: ['Swap In Col', 'SWCL', 'Swap positions with a box on the same grid column'],
  shiftRow: ['Shift Row', 'SHRW', 'Shift an entire row of boxes horizontally'],
  shiftCol: ['Shift Col', 'SHCL', 'Shift an entire column of boxes vertically'],
}

export const crossoverMeta: Record<string, MutationMetaEntry> = {
  crossover: [
    'Positional',
    'CROR',
    'Randomly mix genes from two parents based on crossoverMix probability',
  ],
  crossoverStructural: [
    'Structural',
    'CROS',
    'Copy one box and all its descendants from parent2 into parent1',
  ],
}

// Maps config key → shortcut strings it relates to (for cross-highlighting)
export const configFeatureTags: Partial<Record<keyof Config, string[]>> = {
  mutWeightQuadrant: ['QUAD'],
  mutWeightSingle: ['SNGL'],
  mutWeightChildren: ['CHLD'],
  mutWeightParents: ['PRNT'],
  mutWeightSwapSibling: ['SWSB'],
  mutWeightSwapRandom: ['SWRN'],
  mutWeightSwapInRow: ['SWRW'],
  mutWeightSwapInCol: ['SWCL'],
  mutWeightShiftRow: ['SHRW'],
  mutWeightShiftCol: ['SHCL'],
  maxChildren: ['CHLD'],
  maxParents: ['PRNT'],
  mutate: ['QUAD', 'SNGL', 'CHLD', 'PRNT', 'SHRW', 'SHCL'],
  mutationRate: ['QUAD', 'SNGL', 'CHLD', 'PRNT', 'SWSB', 'SWRN', 'SWRW', 'SWCL', 'SHRW', 'SHCL'],
  crossoverRate: ['CROR', 'CROS'],
  crossoverMix: ['CROR'],
  crossWeightRandom: ['CROR'],
  crossWeightStruct: ['CROS'],
}

// Maps mutation/crossover key → primary config weight key
export const mutationConfigMap: Record<string, string> = {
  quadrant: 'mutWeightQuadrant',
  single: 'mutWeightSingle',
  children: 'mutWeightChildren',
  parents: 'mutWeightParents',
  swapSibling: 'mutWeightSwapSibling',
  swapRandom: 'mutWeightSwapRandom',
  swapInRow: 'mutWeightSwapInRow',
  swapInCol: 'mutWeightSwapInCol',
  shiftRow: 'mutWeightShiftRow',
  shiftCol: 'mutWeightShiftCol',
  crossover: 'crossoverWeightPositional',
  crossoverStructural: 'crossoverWeightStructural',
}

export const statMeta: Record<string, MutationMetaEntry> = {
  att: ['Attempts', 'ATT', 'How many times this mutation was selected by roulette wheel'],
  imp: [
    'Improvement %',
    'IMP',
    'Percentage of attempts that produced a better score than the parent',
  ],
  davg: ['Avg Δ Score', 'ΔAVG', 'Average fitness change per attempt (negative = improvement)'],
  best: [
    'Best lineage',
    'BEST',
    'How many times this mutation found a new all-time best individual. Zero = dead weight (never improved the best).',
  ],
}

export function createMutationStat(): MutationStat {
  return { attempts: 0, improvements: 0, survived: 0, totalDelta: 0 }
}

export function createRunMonitor(): RunMonitor {
  return {
    snapshots: [],
    runTotals: {},
    bestLineage: [],
    deadWeightMutations: [],
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export function computePopulationDiversity(
  population: { layouts: Box[] }[],
  cfg: Pick<Required<Config>, 'gridX' | 'gridY'>,
): number {
  const n = population.length
  if (n <= 1) return 0
  const boxCount = population[0]?.layouts.length || 1

  // Discretize to grid
  const disc = population.map((ind) =>
    ind.layouts.map((b) => ({
      x: Math.round(b.x / cfg.gridX),
      y: Math.round(b.y / cfg.gridY),
    })),
  )

  // Compute range for normalization
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const ind of disc) {
    for (const b of ind) {
      if (b.x < minX) minX = b.x
      if (b.x > maxX) maxX = b.x
      if (b.y < minY) minY = b.y
      if (b.y > maxY) maxY = b.y
    }
  }
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  // Average pairwise normalized Manhattan distance
  let totalDist = 0
  let pairs = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let dist = 0
      const len = Math.min(disc[i].length, disc[j].length)
      for (let k = 0; k < len; k++) {
        dist += Math.abs(disc[i][k].x - disc[j][k].x) / rangeX
        dist += Math.abs(disc[i][k].y - disc[j][k].y) / rangeY
      }
      totalDist += dist / (boxCount * 2)
      pairs++
    }
  }

  const raw = pairs > 0 ? totalDist / pairs : 0
  return Math.min(1, raw)
}

export function buildGenerationSnapshot(
  gen: number,
  scores: number[],
  diversity: number,
  stagnation: number,
  mutations: Record<string, MutationStat>,
): GenerationSnapshot {
  const sorted = [...scores].sort((a, b) => a - b)
  return {
    gen,
    best: sorted[0] ?? 0,
    worst: sorted[sorted.length - 1] ?? 0,
    median: percentile(sorted, 50),
    p25: percentile(sorted, 25),
    p75: percentile(sorted, 75),
    diversity,
    stagnation,
    mutations,
  }
}

export function accumulateMutStats(
  totals: Record<string, MutationStat>,
  genStats: Record<string, MutationStat>,
): void {
  for (const [name, stat] of Object.entries(genStats)) {
    if (!totals[name]) totals[name] = createMutationStat()
    totals[name].attempts += stat.attempts
    totals[name].improvements += stat.improvements
    totals[name].survived += stat.survived
    totals[name].totalDelta += stat.totalDelta
  }
}

export function computeDeadWeightMutations(
  population: { lastMutation?: string }[],
  runTotals: Record<string, MutationStat>,
): string[] {
  const topN = Math.max(1, Math.ceil(population.length * 0.1))
  // population is assumed sorted best-first when this is called
  const topMutations = new Set<string>()
  for (let i = 0; i < topN; i++) {
    const m = population[i]?.lastMutation
    if (m) topMutations.add(m)
  }
  return Object.keys(runTotals).filter((name) => !topMutations.has(name) && name !== 'crossover')
}
