// Example fixtures and which presets/groups are valid per example.
// ex5 (the-voice) requires `cluster > 0` — too large for non-clustered GA.

import { dirname, fromFileUrl, resolve } from 'jsr:@std/path'

const HERE = dirname(fromFileUrl(import.meta.url))
const FIX = resolve(HERE, '../../layout-maxing-cli/tests/fixtures')

export interface ExampleDef {
  name: string
  file: string
  clusteredOnly: boolean // true → only run with cluster>0 configs
}

export const EXAMPLES: ExampleDef[] = [
  { name: 'example-1', file: `${FIX}/test.json`, clusteredOnly: false },
  { name: 'example-2', file: `${FIX}/the-synth.json`, clusteredOnly: false },
  { name: 'example-3', file: `${FIX}/reverb-example.json`, clusteredOnly: false },
  { name: 'example-4', file: `${FIX}/reverb-grouped-example.json`, clusteredOnly: false },
  { name: 'example-5', file: `${FIX}/the-voice.rnbopat`, clusteredOnly: true },
]

export function findExample(name: string): ExampleDef | undefined {
  return EXAMPLES.find((e) => e.name === name)
}

export const NON_CLUSTERED_EXAMPLES = EXAMPLES.filter((e) => !e.clusteredOnly)
export const CLUSTERED_EXAMPLES = EXAMPLES.filter((e) => e.clusteredOnly)
