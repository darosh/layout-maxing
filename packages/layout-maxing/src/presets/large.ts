import type { Config } from '../config.ts'

export default {
  popSize: 40,
  stop: 299,
  generations: 50000,
  passes: 1,
  stagnationThreshold: 15,
  catastropheThreshold: 40,
  catastropheFraction: 0.3,
  viewExponent: 1.05,
  diversityBoost: 1.0,
  diversityBoostCap: 4,
  mutWeightSwapSibling: 40,
  mutWeightChildren: 50,
  elkMrTree: true
} satisfies Config
