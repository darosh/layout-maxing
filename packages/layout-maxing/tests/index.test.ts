import { expect, test } from 'vite-plus/test'
import { toSvg } from '../src/index.ts'

test('toSvg', () => {
  expect(toSvg([], [])).toContain('<svg')
})
