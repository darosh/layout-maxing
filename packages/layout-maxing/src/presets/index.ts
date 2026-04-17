import Default from './default.ts'
import Fast from './fast.ts'
import Medium from './medium.ts'
import Large from './large.ts'
import Raw from './raw.ts'

const Larger = {
  ...Large,
  crossPenalty: 1.1,
  overPenalty: 3,
  totalCrossPenalty: 1,
  reversePenalty: 2,
  arMax: 1.5,
  mutationRate: 0.8,
  crossWeightRandom: 5,
  tournamentSize: 0.5,
  banditEnabled: true,
  banditExploration: 1.5,
  mutate: 1,
  mutateXYOverlap: 0.1,
}

export const PRESETS = {
  Default,
  Fast,
  Medium,
  Large,
  Larger,
  Raw,
}
