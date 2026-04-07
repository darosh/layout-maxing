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
  arPenalty?: number
  arMax?: number
  // GA parameters
  svgAtStop?: number
  stop?: number
  popSize?: number
  generations?: number
  mutationRate?: number
  maxChildren?: number
  maxParents?: number
  crossoverRate?: number
  crossoverMix?: number
  tournamentSize?: number
  mutate?: number
  // Mutation weights (unitless, roulette selection)
  mutWeightQuadrant?: number
  mutWeightSingle?: number
  mutWeightChildren?: number
  mutWeightParents?: number
  mutWeightSwapSibling?: number
  mutWeightSwapRandom?: number
  // Control flags
  showStraightLines?: boolean
  deterministic?: boolean
  useDagre?: boolean
  useInput?: boolean
  useSimpleFlow?: boolean
  // Logging / debug output
  logInfo?: boolean
  logProgress?: boolean
  logProgressInterval?: number
  writeSvg?: boolean
  writeJson?: boolean
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
  minDistY: [60, 0, 100, 1, 'Minimum vertical distance between boxes'],
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
  arPenalty: [1.02, 1, 2, 0.01, 'Exponential multiplier based on aspect ratio of the viewport'],
  arMax: [5, 1, 25, 0.01, 'Maximum non-penalized aspect ratio'],
  // GA parameters
  svgAtStop: [9995, 0, 100000, 1, 'Generation count at which to write final SVG snapshot'],
  stop: [9999, 1, 100000, 1, 'Stop after this many generations without improvement'],
  popSize: [15, 10, 1000, 1, 'Number of individuals in the population'],
  generations: [100000, 100, 1000000, 1, 'Maximum total generations to run'],
  mutationRate: [0.95, 0, 1, 0.001, 'Probability that a child is mutated after crossover'],
  maxChildren: [9, 1, 20, 1, 'Maximum number of children produced per generation step'],
  maxParents: [9, 1, 20, 1, 'Maximum number of parents selected per generation step'],
  crossoverRate: [0.75, 0, 1, 0.01, 'Probability of performing crossover between two parents'],
  crossoverMix: [
    0.25,
    0,
    1,
    0.01,
    'Fraction of genes taken from the second parent during crossover',
  ],
  tournamentSize: [0.5, 0, 1, 0.1, 'Fraction of population sampled in tournament selection'],
  mutate: [0.5, 0, 10, 0.1, 'Box mutation range in viewport units'],
  // Mutation weights
  mutWeightQuadrant: [30, 0, 100, 1, 'Roulette weight for quadrant-flip mutation'],
  mutWeightSingle: [30, 0, 100, 1, 'Roulette weight for single-node position mutation'],
  mutWeightChildren: [30, 0, 100, 1, 'Roulette weight for children-group mutation'],
  mutWeightParents: [0, 0, 100, 1, 'Roulette weight for parents-group mutation'],
  mutWeightSwapSibling: [20, 0, 100, 1, 'Roulette weight for sibling-swap mutation'],
  mutWeightSwapRandom: [20, 0, 100, 1, 'Roulette weight for random-pair swap mutation'],
  // Control flags
  showStraightLines: [false, false, true, null, 'Render straight lines instead of curves'],
  deterministic: [true, false, true, null, 'Use a fixed random seed for reproducible results'],
  useDagre: [true, false, true, null, 'Use Dagre for initial layout before GA optimization'],
  useInput: [false, false, true, null, 'Use the input file layout as the GA starting point'],
  useSimpleFlow: [
    false,
    false,
    true,
    null,
    'Use simple flow for initial layout before GA optimization',
  ],
  // Logging / debug output
  logInfo: [true, false, true, null, 'Log info messages to console'],
  logProgress: [true, false, true, null, 'Log progress stats to console each interval'],
  logProgressInterval: [2000, 200, 60000, 500, 'Min ms between progress log lines'],
  writeSvg: [false, false, true, null, 'Write SVG visualization file (CLI only)'],
  writeJson: [false, false, true, null, 'Write JSON data file with layouts and lines (CLI only)'],
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
