import type { Config } from '../config.ts'

export default {
  popSize: 30,
  stop: 499,
  stagnationThreshold: 20,
  catastropheThreshold: 60,
  catastropheFraction: 0.4,
  diversityBoost: 0.8,
  diversityBoostCap: 3,
  elkMrTree: true
} satisfies Config
