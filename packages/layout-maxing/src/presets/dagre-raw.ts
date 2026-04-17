import type { Config } from '../config.ts'

export default {
  popSize: 3,
  generations: 1,
  repairOffspring: false,
  shrinkRows: false,
  normalize: false,
  passes: 1,
  normalizeExport: false,
  initialMutation: false,
  dagreLongestPath: true,
  dagreNetworkSimplex: true,
  dagreTightTree: true,
} satisfies Config
