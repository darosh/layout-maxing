import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { fitness, createInitialLayouts, buildGroupPlan, type RNBO } from '../src/index.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const optimizedFixturePath = resolve(
  __dirname,
  '../../layout-maxing-cli/tests/fixtures/reverb-grouped-optimized.json',
)

function loadOptimizedWithGroups(): RNBO {
  const patcher = JSON.parse(readFileSync(optimizedFixturePath, 'utf-8'))
  return { patcher }
}

test('grouped boxes do not contribute to minDist violations', () => {
  const rnbo = loadOptimizedWithGroups()
  const patcher = rnbo.patcher
  const layouts = createInitialLayouts(patcher)
  const lines = patcher.lines

  // Without groupMap: the 4 tightly-packed group boxes produce exactly 3 pair violations (C(4,2)=6 pairs, 3 within-group)
  const withoutGroup = fitness(layouts, lines, { minDistY: 15 })
  expect(withoutGroup.minDist, 'should detect minDist violations without groupMap').toBe(3)

  // With groupIdx stamped on layouts: grouped pairs are excluded
  const groupPlan = buildGroupPlan(layouts, patcher.boxgroups)
  const byId = new Map(layouts.map((l) => [l.id, l]))
  groupPlan.forEach((g, i) => {
    byId.get(g.leaderId)!.groupIdx = i
    g.members.forEach((m) => {
      const l = byId.get(m.id)
      if (l) l.groupIdx = i
    })
  })

  const withGroup = fitness(layouts, lines, { minDistY: 15 })
  expect(withGroup.minDist, 'grouped boxes should not be counted as minDist violations').toBe(0)
})
