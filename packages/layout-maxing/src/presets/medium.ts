import type { Config } from '../config.ts'

export default {
  popSize: 30,
  stop: 500,
  passes: 3,
  repairOffspring: false,
  stagnationThreshold: 20,
  catastropheThreshold: 60,
  catastropheFraction: 0.4,
  dagreLongestPath: true,
  diversityBoost: 0.8,
  diversityBoostCap: 3,
} satisfies Config
