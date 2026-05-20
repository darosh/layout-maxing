import type { Config } from '../config.ts'

export default {
  cluster: 6,
  clusterMax: 12,
  passes: 1,
  initialMutation: false,
  stop: 1499,
  popSize: 40,
  tournamentSize: 0.3,
  nichingEnabled: true,
  nichingRadius: 0.8,
  nichingExponent: 1.2,
  eliteSize: 4,
  saEnabled: true,
} satisfies Config
