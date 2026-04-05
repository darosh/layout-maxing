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
  totalCrossPenalty?: number
  totalOverPenalty?: number
  reversePenalty?: number
  areaPenalty?: number
  // GA parameters
  svgAtStop?: number
  stop?: number
  popSize?: number
  generations?: number
  mutationRate?: number
  swapRate?: number
  noProgressBoost?: number
  mutateChildren?: number
  mutateParents?: number
  maxChildren?: number
  maxParents?: number
  siblingsSwapRate?: number
  crossoverRate?: number
  crossoverMix?: number
  tournamentSize?: number
  mutate?: number
  // Control flags
  showStraightLines?: boolean
  deterministic?: boolean
  useDagre?: boolean
}

export const defaultConfig: Required<Config> = {
  // Grid & spacing
  gridX: 30,
  gridY: 60,
  minDistX: 15,
  minDistY: 60,
  boxZone: 5,
  letOffest: 9.5,
  curveControl: 15,
  // Fitness penalties
  crossPenalty: 1.5,
  overPenalty: 6,
  totalCollisionPenalty: 1.04,
  totalCrossPenalty: 1.01,
  totalOverPenalty: 1.02,
  reversePenalty: 3,
  areaPenalty: 1.5,
  // GA parameters
  svgAtStop: 9995,
  stop: 10000,
  popSize: 15,
  generations: 100000,
  mutationRate: 0.95,
  swapRate: 0.004,
  noProgressBoost: 0,
  mutateChildren: 0.75,
  mutateParents: 0,
  maxChildren: 9,
  maxParents: 0,
  siblingsSwapRate: 0.5,
  crossoverRate: 0.75,
  crossoverMix: 0.25,
  tournamentSize: 0.5,
  mutate: 0.5,
  showStraightLines: false,
  deterministic: true,
  useDagre: true,
}
