import type { Config } from '../config.ts'

export default {
  stop: 1499,
  popSize: 40,
  passes: 1,
  tournamentSize: 0.3,
  nichingEnabled: true,
  nichingRadius: 0.8,
  nichingExponent: 1.2,
  eliteSize: 4,
  saEnabled: true,
} satisfies Config
