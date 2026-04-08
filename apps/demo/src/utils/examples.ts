import E1 from '../../../../packages/layout-maxing-cli/tests/fixtures/two-boxes-clipboard.json' with { type: 'json' }
import E2 from '../../../../packages/layout-maxing-cli/tests/fixtures/test.maxpat'
import E3 from '../../../../packages/layout-maxing-cli/tests/fixtures/the-synth.rnbopat'
// import E4 from '../../../../packages/layout-maxing-cli/tests/fixtures/the-synth.maxpat'
import type { RNBO } from 'layout-maxing'

export const EXAMPLES: RNBO[] = <RNBO[]>(<unknown[]>[{ patcher: E1 }, E2, E3])
