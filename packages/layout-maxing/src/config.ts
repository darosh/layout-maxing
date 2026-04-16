import { configMeta } from './meta.ts'

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
  viewExponent?: number
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
  dagreLR?: boolean
  useElk?: boolean
  elkLR?: boolean
  useInput?: boolean
  usePassBest?: boolean
  useSimpleFlow?: boolean
  useZero?: boolean
  useSquare?: boolean
  useCircle?: boolean
  shrinkRows?: boolean
  initialMutation?: boolean
  // Logging / debug output
  logInfo?: boolean
  logProgress?: boolean
  logProgressInterval?: number
  writeSvg?: boolean
  writeJson?: boolean
  workers?: number
}

export const defaultConfig: Required<Config> = Object.fromEntries(Object.entries(configMeta).map(([k, v]) => [k, v[0]])) as Required<Config>
