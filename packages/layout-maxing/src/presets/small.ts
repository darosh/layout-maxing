import type { Config } from '../config.ts'

export default {
  popSize: 20,
  stop: 2000,
  passes: 4,
  repairOffspring: true,
  stagnationThreshold: 30,
  catastropheThreshold: 100,
  catastropheFraction: 0.5,
  dagreLongestPath: true,
  useSimpleFlow: true,
} satisfies Config
