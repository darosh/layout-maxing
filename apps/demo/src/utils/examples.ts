// import E1 from '../../../../packages/layout-maxing-cli/tests/fixtures/two-boxes-clipboard.json'
import E2 from '../../../../packages/layout-maxing-cli/tests/fixtures/test.json'
import E3 from '../../../../packages/layout-maxing-cli/tests/fixtures/the-synth.json'
// import E4 from '../../../../packages/layout-maxing-cli/tests/fixtures/the-synth.maxpat'
import E5 from '../../../../packages/layout-maxing-cli/tests/fixtures/reverb-example.json'
import E6 from '../../../../packages/layout-maxing-cli/tests/fixtures/reverb-grouped-example.json'
import type { RNBO } from 'layout-maxing'

export const EXAMPLES: RNBO[] = <RNBO[]>(<unknown[]>[
  { patcher: E2, best: 3934 },
  { patcher: E3, best: 13332 },
  { patcher: E5, best: 10014 },
  { patcher: E6, best: 10888 },
])
