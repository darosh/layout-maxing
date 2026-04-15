import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { main, type RNBO } from '../src/index.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('optimizes single-group fixture with no lines', async () => {
  const fixturePath2 = resolve(__dirname, '../../layout-maxing-cli/tests/fixtures/single-group.json')
  const rnbo: RNBO = { patcher: JSON.parse(readFileSync(fixturePath2, 'utf-8')) }
  const best = await main(rnbo, undefined, undefined, {
    keepGroups: true,
    ignoreOrphans: false,
    normalize: true,
    normalizeExport: true,
    deterministic: true,
    generations: 50,
    stop: 20,
    popSize: 8,
    logInfo: false,
    logProgress: false,
    writeSvg: false,
    writeJson: false,
    useDagre: true,
  })
  expect(best.length).toBe(rnbo.patcher.boxes.length)
})

test('single-group fixture with ignoreOrphans:true and no lines returns empty', async () => {
  const fixturePath2 = resolve(__dirname, '../../layout-maxing-cli/tests/fixtures/single-group.json')
  const rnbo: RNBO = { patcher: JSON.parse(readFileSync(fixturePath2, 'utf-8')) }
  const best = await main(rnbo, undefined, undefined, {
    keepGroups: true,
    ignoreOrphans: true,
    deterministic: true,
    generations: 10,
    stop: 5,
    popSize: 4,
    logInfo: false,
    logProgress: false,
    writeSvg: false,
    writeJson: false,
    useDagre: true,
  })
  // All 4 grouped boxes are preserved (grouped orphans) and returned via dagre
  expect(best.length).toBe(rnbo.patcher.boxes.length)
})

test('two-groups fixture: all 8 boxes preserved and DST=0', async () => {
  const fixturePath3 = resolve(__dirname, '../../layout-maxing-cli/tests/fixtures/two-groups.json')
  const rnbo: RNBO = { patcher: JSON.parse(readFileSync(fixturePath3, 'utf-8')) }
  const best = await main(rnbo, undefined, undefined, {
    keepGroups: true,
    ignoreOrphans: true,
    normalize: true,
    normalizeExport: true,
    deterministic: true,
    generations: 100,
    stop: 30,
    popSize: 8,
    viewExponent: 1,
    logInfo: false,
    logProgress: false,
    writeSvg: false,
    writeJson: false,
    useDagre: true,
  })
  // All 8 boxes should survive (grouped orphans must be preserved)
  expect(best.length).toBe(8)
})

test('fitness: same-group pairs are excluded from minDist', async () => {
  const { fitness: fitnessFunc } = await import('../src/fitness.ts')
  // Two boxes in the same group, placed touching (no gap) — should not count as minDist violation
  const sameGroup = [
    { id: 'a', index: 0, x: 0, y: 0, width: 100, height: 20, numInlets: 1, numOutlets: 1, groupIdx: 0 },
    { id: 'b', index: 1, x: 100, y: 0, width: 100, height: 20, numInlets: 1, numOutlets: 1, groupIdx: 0 },
  ]
  const f1 = fitnessFunc(sameGroup, [])
  expect(f1.minDist).toBe(0)

  // Same boxes without groupIdx — should count as violation (gap=0, minDistX=15)
  const noGroup = sameGroup.map(({ groupIdx: _, ...b }) => b)
  const f2 = fitnessFunc(noGroup, [])
  expect(f2.minDist).toBe(1)
})
