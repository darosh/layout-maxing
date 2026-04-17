import type { Config } from '../config.ts'

export default {
  popSize: 40,
  stop: 300,
  passes: 2,
  repairOffspring: false,
  stagnationThreshold: 15,
  catastropheThreshold: 40,
  catastropheFraction: 0.3,
  useDagre: true,
  viewExponent: 0.05,
  diversityBoost: 1.0,
  diversityBoostCap: 4,
  mutWeightSwapSibling: 40,
  mutWeightChildren: 50,
} satisfies Config
