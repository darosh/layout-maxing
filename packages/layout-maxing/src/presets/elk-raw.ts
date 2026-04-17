import type { Config } from '../config.ts'

export default {
  popSize: 6,
  generations: 1,
  repairOffspring: false,
  shrinkRows: false,
  normalize: false,
  passes: 1,
  normalizeExport: false,
  initialMutation: false,
  dagreLongestPath: false,
  elkLayered: true,
  elkBox: true,
  elkForce: true,
  elkMrTree: true,
  elkRectPacking: true,
  elkStress: true,
} satisfies Config
