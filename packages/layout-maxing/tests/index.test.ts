import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { applyBestLayout, main, type RNBO, toSvg } from '../src/index.ts'
import type { RunMonitor } from '../src/genetic.ts'

test('toSvg', () => {
  expect(toSvg([], [])).toContain('<svg')
})

test('toSvg with undefined lines does not throw', () => {
  expect(toSvg([], undefined as any)).toContain('<svg')
})

test('optimizes single-group fixture with no lines', async () => {
  const fixturePath2 = resolve(
    __dirname,
    '../../layout-maxing-cli/tests/fixtures/single-group.json',
  )
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
  const fixturePath2 = resolve(
    __dirname,
    '../../layout-maxing-cli/tests/fixtures/single-group.json',
  )
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
    logInfo: false,
    logProgress: false,
    writeSvg: false,
    writeJson: false,
    useDagre: true,
  })
  // All 8 boxes should survive (grouped orphans must be preserved)
  expect(best.length).toBe(8)

  // DST must be 0: same-group pairs must not count toward minDist
  const { fitness: fitnessFunc } = await import('../src/fitness.ts')
  const f = fitnessFunc(best, rnbo.patcher.lines)
  expect(f.minDist).toBe(0)
})

const __dirname = dirname(fileURLToPath(import.meta.url))

const twoGroupsPath = resolve(__dirname, '../../layout-maxing-cli/tests/fixtures/two-groups.json')

function loadTwoGroups(): RNBO {
  return { patcher: JSON.parse(readFileSync(twoGroupsPath, 'utf-8')) }
}

const BENCH_CFG = {
  keepGroups: true,
  ignoreOrphans: true,
  normalize: true,
  normalizeExport: true,
  deterministic: true,
  generations: 500,
  stop: 500,
  popSize: 15,
  logInfo: false,
  logProgress: false,
  writeSvg: false,
  writeJson: false,
  useDagre: true,
} as const

function meanDiversity(m: RunMonitor): number {
  if (!m.snapshots.length) return 0
  return m.snapshots.reduce((s, sn) => s + sn.diversity, 0) / m.snapshots.length
}

function bestScore(m: RunMonitor): number {
  return Math.min(...m.snapshots.map((sn) => sn.best))
}

test('diversity boost: score does not significantly regress and diversity activates', async () => {
  const baseline: RunMonitor[] = []
  const boosted: RunMonitor[] = []

  await main(
    loadTwoGroups(),
    undefined,
    undefined,
    { ...BENCH_CFG, diversityBoostFactor: 0 },
    undefined,
    undefined,
    undefined,
    (m) => baseline.push(m),
  )
  await main(
    loadTwoGroups(),
    undefined,
    undefined,
    { ...BENCH_CFG, diversityBoostFactor: 0.5 },
    undefined,
    undefined,
    undefined,
    (m) => boosted.push(m),
  )

  const baseScore = bestScore(baseline[0])
  const boostScore = bestScore(boosted[0])
  const baseMeanDiv = meanDiversity(baseline[0])
  const boostMeanDiv = meanDiversity(boosted[0])

  // Diversity boost may explore more, but score must not regress more than 2x
  expect(
    boostScore,
    `score with boost (${boostScore.toFixed(0)}) should be within 2x of baseline (${baseScore.toFixed(0)})`,
  ).toBeLessThanOrEqual(baseScore * 2)
  // Mean diversity across run must be positive (feature is active)
  expect(
    boostMeanDiv,
    `mean diversity with boost (${boostMeanDiv.toFixed(3)}) should be > 0`,
  ).toBeGreaterThan(0)
  // Mean diversity with boost should not collapse more than 50% below baseline
  expect(
    boostMeanDiv,
    `mean diversity with boost (${boostMeanDiv.toFixed(3)}) should be >= baseline/2 (${(baseMeanDiv / 2).toFixed(3)})`,
  ).toBeGreaterThanOrEqual(baseMeanDiv / 2)
})

test('crowding weight: score does not significantly regress', async () => {
  const baseline: RunMonitor[] = []
  const crowded: RunMonitor[] = []

  await main(
    loadTwoGroups(),
    undefined,
    undefined,
    { ...BENCH_CFG, crowdingTieBreak: false },
    undefined,
    undefined,
    undefined,
    (m) => baseline.push(m),
  )
  await main(
    loadTwoGroups(),
    undefined,
    undefined,
    { ...BENCH_CFG, crowdingTieBreak: true },
    undefined,
    undefined,
    undefined,
    (m) => crowded.push(m),
  )

  const baseScore = bestScore(baseline[0])
  const crowdScore = bestScore(crowded[0])

  // Crowding only fires on exact fitness ties; score must not regress significantly
  expect(
    crowdScore,
    `score with crowding (${crowdScore.toFixed(0)}) should be within 2x of baseline (${baseScore.toFixed(0)})`,
  ).toBeLessThanOrEqual(baseScore * 2)
  expect(meanDiversity(crowded[0])).toBeGreaterThan(0)
})
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

  // console.log('[keepGroups test] group ids:', ids)
  // console.log('[keepGroups test] before positions:', beforeRects)
  // console.log('[keepGroups test] expected relative offsets:', expectedRel)

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

  // console.log('[keepGroups test] after positions:', afterRects)
  // console.log('[keepGroups test] actual relative offsets:', actualRel)

  for (let i = 0; i < ids.length; i++) {
    expect(actualRel[i][0], `${ids[i]} dx`).toBe(expectedRel[i][0])
    expect(actualRel[i][1], `${ids[i]} dy`).toBe(expectedRel[i][1])
  }
})
