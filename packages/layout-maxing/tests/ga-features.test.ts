import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { main, type RNBO } from '../src/index.ts'
import type { RunMonitor } from '../src/genetic.ts'

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
    { ...BENCH_CFG, diversityBoost: 0 },
    undefined,
    undefined,
    undefined,
    (m) => baseline.push(m),
  )
  await main(
    loadTwoGroups(),
    undefined,
    undefined,
    { ...BENCH_CFG, diversityBoost: 0.5 },
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
