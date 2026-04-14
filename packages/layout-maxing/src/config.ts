export interface Config {
  // Grid & spacing
  gridX?: number
  gridY?: number
  minDistX?: number
  minDistY?: number
  boxZone?: number
  letOffest?: number
  curveControl?: number
  // Fitness penalties
  crossPenalty?: number
  overPenalty?: number
  totalCollisionPenalty?: number
  totalSSCPenalty?: number
  misalignedSSPenalty?: number
  misalignedFirstPenalty?: number
  totalCrossPenalty?: number
  totalOverPenalty?: number
  reversePenalty?: number
  areaPenalty?: number
  totalDistPenalty?: number
  arPenalty?: number
  arMax?: number
  // GA parameters
  svgAtStop?: number
  stop?: number
  popSize?: number
  generations?: number
  passes?: number
  mutationRate?: number
  maxChildren?: number
  maxParents?: number
  crossoverRate?: number
  crossoverMix?: number
  crossWeightRandom?: number
  crossWeightStruct?: number
  tournamentSize?: number
  diversityBoost?: number
  diversityBoostCap?: number
  diversityBoostFactor?: number
  catastropheThreshold?: number
  catastropheFraction?: number
  initMutations?: number
  crowdingTieBreak?: boolean
  nichingEnabled?: boolean
  nichingRadius?: number
  nichingExponent?: number
  stagnationThreshold?: number
  stagnationRate?: number
  eliteSize?: number
  banditEnabled?: boolean
  banditK?: number
  banditExploration?: number
  multiMutRate?: number
  repairOffspring?: boolean
  nsgaEnabled?: boolean
  mutate?: number
  mutateXYOverlap?: number
  // Mutation weights (unitless, roulette selection)
  mutWeightQuadrant?: number
  mutWeightSingle?: number
  mutWeightChildren?: number
  mutWeightParents?: number
  mutWeightSwapSibling?: number
  mutWeightSwapRandom?: number
  mutWeightSwapInRow?: number
  mutWeightSwapInCol?: number
  mutWeightShiftRow?: number
  mutWeightShiftCol?: number
  // Control flags
  showStraightLines?: boolean
  removeLineSegments?: boolean
  deterministic?: boolean
  seed?: number
  normalize?: boolean
  normalizeExport?: boolean
  ignoreOrphans?: boolean
  keepGroups?: boolean
  useDagre?: boolean
  useInput?: boolean
  useSimpleFlow?: boolean
  useZero?: boolean
  useSquare?: boolean
  useCircle?: boolean
  initialMutation?: boolean
  // Logging / debug output
  logInfo?: boolean
  logProgress?: boolean
  logProgressInterval?: number
  writeSvg?: boolean
  writeJson?: boolean
  workers?: number
}

// Tuple: [default, min, max, step | null, description]
export type ConfigMetaEntry = [
  default_: number | boolean,
  min: number | boolean,
  max: number | boolean,
  step: number | null,
  description: string,
]

export type ConfigMeta = Record<keyof Config, ConfigMetaEntry>

export const configMeta: ConfigMeta = {
  // Grid & spacing
  gridX: [30, 1, 100, 1, 'Horizontal grid snap size in pixels'],
  gridY: [60, 1, 100, 1, 'Vertical grid snap size in pixels'],
  minDistX: [15, 0, 100, 1, 'Minimum horizontal distance between boxes'],
  minDistY: [10, 0, 100, 1, 'Minimum vertical distance between boxes'],
  boxZone: [5, 0, 50, 1, 'Extra padding zone around each box for line collision'],
  letOffest: [9.5, 0, 50, 0.5, 'Inlet/outlet offset from the box edge'],
  curveControl: [15, 0, 100, 1, 'Bezier curve control point distance for edge routing'],
  // Fitness penalties
  crossPenalty: [1.5, 1, 10, 0.1, 'Multiplier penalty for line-line crossing'],
  overPenalty: [6, 1, 10, 0.1, 'Multiplier penalty line overlaps'],
  totalCollisionPenalty: [1.04, 1, 2, 0.01, 'Exponential multiplier for line-box collisions'],
  totalSSCPenalty: [
    1.04,
    1,
    2,
    0.01,
    'Exponential multiplier for single-outlet single-connection self-collisions (SSC)',
  ],
  misalignedSSPenalty: [
    1.02,
    1,
    2,
    0.01,
    'Exponential multiplier for misaligned SSC sibling sources sharing a common child',
  ],
  misalignedFirstPenalty: [
    0,
    0,
    10,
    0.1,
    'Additive penalty per pixel of x-misalignment for first-outlet to first-inlet connections',
  ],
  totalCrossPenalty: [1.01, 1, 2, 0.01, 'Exponential multiplier line-line crossings'],
  totalOverPenalty: [1.02, 1, 2, 0.01, 'Exponential multiplier line-line overlaps'],
  reversePenalty: [3, 1, 10, 0.1, 'Multiplier penalty for lines connecting to inlet in upper box'],
  areaPenalty: [1.5, 1, 2, 0.1, 'Exponential multiplier based on number of overlapping boxes'],
  totalDistPenalty: [
    1.4,
    1,
    2,
    0.1,
    'Exponential multiplier for minDistX/minDistY pair violations',
  ],
  arPenalty: [1.02, 1, 2, 0.01, 'Exponential multiplier based on aspect ratio of the viewport'],
  arMax: [5, 1, 25, 0.01, 'Maximum non-penalized aspect ratio'],
  // GA parameters
  svgAtStop: [9995, 0, 100000, 1, 'Generation count at which to write final SVG snapshot'],
  stop: [999, 1, 100000, 1, 'Stop after this many generations without improvement'],
  popSize: [20, 1, 1000, 1, 'Number of individuals in the population'],
  generations: [100000, 1, 1000000, 1, 'Maximum total generations to run'],
  passes: [4, 1, 100000, 1, 'Number of times to run the full GA (best result kept across passes)'],
  mutationRate: [0.85, 0, 1, 0.01, 'Probability that a child is mutated after crossover'],
  maxChildren: [9, 1, 20, 1, 'Maximum number of children mutated'],
  maxParents: [1, 1, 20, 1, 'Maximum number of parents mutated'],
  crossoverRate: [0.75, 0, 1, 0.01, 'Probability of performing crossover between two parents'],
  crossoverMix: [
    0.25,
    0,
    1,
    0.01,
    'Fraction of genes taken from the second parent during crossover',
  ],
  crossWeightRandom: [10, 0, 100, 1, 'Roulette weight for positional crossover (per-box mix)'],
  crossWeightStruct: [
    10,
    0,
    100,
    1,
    'Roulette weight for structural crossover (one box + descendants)',
  ],
  tournamentSize: [1, 0, 1, 0.1, 'Fraction of population sampled in tournament selection'],
  diversityBoost: [
    0.5,
    0,
    1,
    0.01,
    'Scales up mutation magnitude when population diversity is low; 0 = disabled',
  ],
  diversityBoostCap: [2, 1, 10, 0.1, 'Maximum multiplier applied to mutation magnitude by diversity boost'],
  diversityBoostFactor: [0, 0, 1, 0.01, 'Additive increase to mutationRate per unit of (1-diversity); 0 = disabled'],
  catastropheThreshold: [0, 0, 100000, 1, 'Stagnation gens before catastrophe restart; 0 = disabled'],
  catastropheFraction: [0.5, 0, 1, 0.01, 'Fraction of non-elite population reinitialised on catastrophe'],
  initMutations: [1, 1, 20, 1, 'Max number of mutations applied per clone during initial population; later clones get progressively more up to this limit'],
  crowdingTieBreak: [
    true,
    false,
    true,
    null,
    'Prefer less-crowded individuals when tournament fitness is tied',
  ],
  nichingEnabled: [
    false,
    false,
    true,
    null,
    'Enable fitness sharing (niching) to maintain population diversity',
  ],
  nichingRadius: [
    5000,
    0,
    1e9,
    1,
    'Sigma: fitness-space distance threshold for niching neighbourhood',
  ],
  nichingExponent: [1, 0.1, 5, 0.1, 'Alpha: shape of the sharing function (1 = linear)'],
  stagnationThreshold: [
    11,
    0,
    100000,
    1,
    'Generations without improvement before boosting mutation rate; 0 = disabled',
  ],
  stagnationRate: [
    1.1,
    1,
    10,
    0.1,
    'Mutation rate multiplier applied during stagnation burst (requires stagnationResetThreshold > 0)',
  ],
  eliteSize: [3, 1, 20, 1, 'Number of elite individuals preserved each generation (1 global best + Pareto front up to eliteSize-1)'],
  banditEnabled: [true, false, true, null, 'Adaptively reweight mutation operators via UCB bandit every banditK generations'],
  banditK: [50, 1, 10000, 1, 'Reweight mutation operators every this many generations'],
  banditExploration: [1.0, 0, 10, 0.1, 'UCB exploration constant for bandit operator selection'],
  multiMutRate: [0, 0, 1, 0.01, 'Per-entity Bernoulli probability of additional mutations; stagnation doubles this rate'],
  repairOffspring: [true, false, true, null, 'Apply fixOverlaps to offspring each generation (consistent with createPopulation)'],
  nsgaEnabled: [false, false, true, null, 'Use NSGA-II rank-based tournament selection instead of alternating single-objective'],
  mutate: [0.5, 0, 10, 0.1, 'Box mutation range in viewport units'],
  mutateXYOverlap: [
    0.2,
    0,
    1,
    0.1,
    'Overlap between x-only and y-only mutation ranges; 0 = exclusive, 1 = always both',
  ],
  // Mutation weights
  mutWeightQuadrant: [30, 0, 100, 1, 'Roulette weight for quadrant-flip mutation'],
  mutWeightSingle: [30, 0, 100, 1, 'Roulette weight for single-node position mutation'],
  mutWeightChildren: [30, 0, 100, 1, 'Roulette weight for children-group mutation'],
  mutWeightParents: [5, 0, 100, 1, 'Roulette weight for parents-group mutation'],
  mutWeightSwapSibling: [20, 0, 100, 1, 'Roulette weight for sibling-swap mutation'],
  mutWeightSwapRandom: [20, 0, 100, 1, 'Roulette weight for random-pair swap mutation'],
  mutWeightSwapInRow: [15, 0, 100, 1, 'Roulette weight for row-neighbor swap mutation'],
  mutWeightSwapInCol: [10, 0, 100, 1, 'Roulette weight for col-neighbor swap mutation'],
  mutWeightShiftRow: [5, 0, 100, 1, 'Roulette weight for shifting all boxes in a row by x delta'],
  mutWeightShiftCol: [5, 0, 100, 1, 'Roulette weight for shifting all boxes in a col by y delta'],
  // Control flags
  showStraightLines: [false, false, true, null, 'Render straight lines instead of curves'],
  removeLineSegments: [true, false, true, null, 'Remove patchline midpoints after applying layout'],
  deterministic: [true, false, true, null, 'Use a fixed random seed for reproducible results'],
  seed: [
    123456789,
    0,
    2147483647,
    1,
    'Seed for deterministic random (ignored unless deterministic=true)',
  ],
  normalize: [true, false, true, null, 'Normalize layouts to origin [0,0] after each generation'],
  normalizeExport: [
    true,
    false,
    true,
    null,
    'Normalize layouts to origin when applying positions back to patch',
  ],
  ignoreOrphans: [true, false, true, null, 'Skip boxes with no incoming or outgoing lines'],
  keepGroups: [true, false, true, null, 'Preserve relative positions within patcher.boxgroups'],
  useDagre: [true, false, true, null, 'Use Dagre for initial layout before GA optimization'],
  useInput: [false, false, true, null, 'Use the input file layout as the GA starting point'],
  useSimpleFlow: [
    false,
    false,
    true,
    null,
    'Use simple flow for initial layout before GA optimization',
  ],
  useZero: [false, false, true, null, 'Place all boxes at position 0,0 as starting layout'],
  useSquare: [
    false,
    false,
    true,
    null,
    'Arrange boxes in a square grid (side = sqrt(count)) snapped to gridX/gridY',
  ],
  useCircle: [
    false,
    false,
    true,
    null,
    'Arrange boxes on a circle (circumference = count × diagonal of grid cell), snapped to grid',
  ],
  initialMutation: [
    true,
    false,
    true,
    null,
    'Mutate extra individuals in the initial population beyond the seed layouts',
  ],
  // Logging / debug output
  logInfo: [true, false, true, null, 'Log info messages to console'],
  logProgress: [true, false, true, null, 'Log progress stats to console each interval'],
  logProgressInterval: [2000, 200, 60000, 500, 'Min ms between progress log lines'],
  writeSvg: [false, false, true, null, 'Write SVG visualization file (CLI only)'],
  writeJson: [false, false, true, null, 'Write JSON data file with layouts and lines (CLI only)'],
  workers: [
    0,
    0,
    128,
    1,
    'Number of fitness workers (0 = auto: cpu count - 1), using number of performance CPU cores recommended',
  ],
}

export const defaultConfig: Required<Config> = Object.fromEntries(
  Object.entries(configMeta).map(([k, v]) => [k, v[0]]),
) as Required<Config>

export function help(): string {
  const lines: string[] = ['Config options (--key value):\n']
  for (const [key, [def, min, max, step, desc]] of Object.entries(configMeta)) {
    const range =
      typeof def === 'boolean'
        ? `boolean, default: ${def}`
        : `default: ${def}, min: ${min}, max: ${max}${step !== null ? `, step: ${step}` : ''}`
    lines.push(`  --${key.padEnd(26)} ${desc}\n    (${range})`)
  }
  return lines.join('\n')
}
