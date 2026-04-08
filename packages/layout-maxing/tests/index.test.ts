import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { applyBestLayout, main, type RNBO, toSvg } from '../src/index.ts'

test('toSvg', () => {
  expect(toSvg([], [])).toContain('<svg')
})

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixturePath = resolve(
  __dirname,
  '../../layout-maxing-cli/tests/fixtures/reverb-grouped-example.json',
)

function loadFixture(): RNBO {
  const patcher = JSON.parse(readFileSync(fixturePath, 'utf-8'))
  return { patcher }
}

test('keepGroups preserves relative positions of grouped boxes', async () => {
  const rnbo = loadFixture()
  const group = rnbo.patcher.boxgroups?.[0]
  expect(group, 'fixture should contain a boxgroup').toBeDefined()
  expect(group!.boxes.length).toBeGreaterThanOrEqual(2)

  // Map id -> patching_rect
  const rectOf = (id: string) => {
    const b = rnbo.patcher.boxes.find((bx) => bx.box.id === id)
    if (!b) throw new Error(`box ${id} not found`)
    return b.box.patching_rect
  }

  const ids = group!.boxes
  const beforeRects = ids.map(rectOf).map((r) => [r[0], r[1]] as [number, number])
  const leaderBefore = beforeRects[0]
  const expectedRel = beforeRects.map(([x, y]) => [x - leaderBefore[0], y - leaderBefore[1]])

  console.log('[keepGroups test] group ids:', ids)
  console.log('[keepGroups test] before positions:', beforeRects)
  console.log('[keepGroups test] expected relative offsets:', expectedRel)

  const best = await main(rnbo, undefined, undefined, {
    keepGroups: true,
    ignoreOrphans: true,
    normalize: true,
    normalizeExport: true,
    deterministic: true,
    generations: 200,
    stop: 50,
    popSize: 12,
    logInfo: false,
    logProgress: false,
    writeSvg: false,
    writeJson: false,
    useDagre: true,
  })
  applyBestLayout(rnbo, best, {
    // applyBestLayout only reads removeLineSegments + normalizeExport
    removeLineSegments: false,
    normalizeExport: true,
  } as any)

  const afterRects = ids.map(rectOf).map((r) => [r[0], r[1]] as [number, number])
  const leaderAfter = afterRects[0]
  const actualRel = afterRects.map(([x, y]) => [x - leaderAfter[0], y - leaderAfter[1]])

  console.log('[keepGroups test] after positions:', afterRects)
  console.log('[keepGroups test] actual relative offsets:', actualRel)

  for (let i = 0; i < ids.length; i++) {
    expect(actualRel[i][0], `${ids[i]} dx`).toBe(expectedRel[i][0])
    expect(actualRel[i][1], `${ids[i]} dy`).toBe(expectedRel[i][1])
  }
})
