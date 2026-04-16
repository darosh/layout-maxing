import { expect, test } from 'vite-plus/test'
import { isSnapped, normalizeLayouts, createInitialLayouts } from '../src/index.ts'
import type { Patcher } from '../src/index.ts'
import patcher from './normalize.json' with { type: 'json' }
import { defaultConfig } from '../src/index.ts'

const cfg = defaultConfig

test('normalizeLayouts shifts min x/y to 0', () => {
  const layouts = createInitialLayouts(patcher as unknown as Patcher)
  normalizeLayouts(layouts)
  const minX = Math.min(...layouts.map((l) => l.x))
  const minY = Math.min(...layouts.map((l) => l.y))
  expect(minX).toBe(0)
  expect(minY).toBe(0)
})

test('isSnapped returns true for snapped layout', () => {
  const layouts = createInitialLayouts(patcher as unknown as Patcher)
  expect(isSnapped(layouts, cfg)).toBe(true)
})

test('snapped layout is  ', () => {})

test('isSnapped returns false when any box is off-grid', () => {
  const layouts = createInitialLayouts(patcher as unknown as Patcher)
  layouts[0].x += 5 // knock one box off-grid
  expect(isSnapped(layouts, cfg)).toBe(false)
})

test('isSnapped returns true after snapping all coords', () => {
  const layouts = createInitialLayouts(patcher as unknown as Patcher)
  for (const l of layouts) {
    l.x = Math.round(l.x / cfg.gridX) * cfg.gridX
    l.y = Math.round(l.y / cfg.gridY) * cfg.gridY
  }
  expect(isSnapped(layouts, cfg)).toBe(true)
})

test('isSnapped returns true for empty array', () => {
  expect(isSnapped([], cfg)).toBe(true)
})
