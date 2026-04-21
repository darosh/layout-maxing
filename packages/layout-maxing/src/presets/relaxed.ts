import type { Config } from '../config.ts'
import Clustered from './clustered.ts'

export default {
  ...Clustered,
  crossPenalty: 1.1,
  totalCrossPenalty: 1,
} satisfies Config
