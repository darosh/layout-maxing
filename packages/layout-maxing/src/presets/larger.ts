import type { Config } from '../config.ts'
import Large from './large.ts'

export default {
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
} satisfies Config
