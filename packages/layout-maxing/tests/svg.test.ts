import { expect, test } from 'vite-plus/test'
import { toSvg } from '../src/index.ts'

test('toSvg', () => {
  expect(toSvg([], [])).toContain('<svg')
})

test('toSvg with undefined lines does not throw', () => {
  expect(toSvg([], undefined as any)).toContain('<svg')
})
