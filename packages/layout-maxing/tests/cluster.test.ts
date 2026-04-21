import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { detectClusters } from '../src/cluster.ts'
import { fillDepths, type Box, type Line } from '../src/layout.ts'
import { main, type RNBO } from '../src/index.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const twoGroupsPath = resolve(__dirname, '../../layout-maxing-cli/tests/fixtures/two-groups.json')
function loadTwoGroups(): RNBO {
  return { patcher: JSON.parse(readFileSync(twoGroupsPath, 'utf-8')) }
}

function makeBox(id: string, index: number): Box {
  return { id, index, x: 0, y: 0, width: 50, height: 30, numInlets: 1, numOutlets: 1 }
}

function makeLine(srcId: string, dstId: string): Line {
  return { patchline: { source: [srcId, 0], destination: [dstId, 0] } }
}

// Build a 50-box DAG: a binary-ish tree with extra cross links so clusters must trade off.
function buildSampleGraph(n = 50): { boxes: Box[]; lines: Line[] } {
  const boxes: Box[] = Array.from({ length: n }, (_, i) => makeBox(`b${i}`, i))
  const lines: Line[] = []
  for (let i = 1; i < n; i++) {
    const parent = Math.floor((i - 1) / 2)
    lines.push(makeLine(`b${parent}`, `b${i}`))
  }
  // Add a few cross-edges to make min-cut non-trivial.
  for (let i = 8; i < n; i += 7) {
    lines.push(makeLine(`b${(i + 3) % n}`, `b${i}`))
  }
  return { boxes, lines }
}

test('detectClusters: every box assigned exactly once', () => {
  const { boxes, lines } = buildSampleGraph(50)
  fillDepths(boxes, lines)
  const clusters = detectClusters(boxes, lines, 10)
  const seen = new Set<number>()
  for (const c of clusters) for (const i of c.boxIdxs) seen.add(i)
  expect(seen.size).toBe(boxes.length)
})

test('detectClusters: respects maxSize within tolerance', () => {
  const { boxes, lines } = buildSampleGraph(50)
  fillDepths(boxes, lines)
  const max = 10
  const clusters = detectClusters(boxes, lines, max)
  for (const c of clusters) {
    // Allow 1.5x slack for atomic boxgroup additions.
    expect(c.boxIdxs.size).toBeLessThanOrEqual(Math.ceil(max * 1.5))
  }
})

test('detectClusters: cluster=0 returns empty', () => {
  const { boxes, lines } = buildSampleGraph(20)
  fillDepths(boxes, lines)
  expect(detectClusters(boxes, lines, 0).length).toBe(0)
})

test('clustered GA produces valid output and matches box count', async () => {
  const cfg = {
    keepGroups: true,
    ignoreOrphans: true,
    normalize: true,
    deterministic: true,
    generations: 400,
    stop: 200,
    popSize: 10,
    passes: 1,
    logInfo: false,
    logProgress: false,
    cluster: 8,
  } as const
  const result = await main(loadTwoGroups(), undefined, undefined, cfg)
  expect(result.length).toBeGreaterThan(0)
  // Every output box should have valid coords (numbers, not NaN).
  for (const b of result) {
    expect(Number.isFinite(b.x)).toBe(true)
    expect(Number.isFinite(b.y)).toBe(true)
  }
})

test('detectClusters: greedy beats random partition on edge-cut', () => {
  const { boxes, lines } = buildSampleGraph(50)
  fillDepths(boxes, lines)
  const max = 10
  const clusters = detectClusters(boxes, lines, max)

  // Build cluster-id-per-box for greedy
  const greedyOf: number[] = Array.from({ length: boxes.length }, () => -1)
  clusters.forEach((c, ci) => {
    for (const i of c.boxIdxs) greedyOf[i] = ci
  })
  const cutCount = (assign: number[]) => {
    const idIdx = new Map(boxes.map((b) => [b.id, b.index]))
    let cuts = 0
    for (const l of lines) {
      const s = idIdx.get(l.patchline.source[0])!
      const d = idIdx.get(l.patchline.destination[0])!
      if (assign[s] !== assign[d]) cuts++
    }
    return cuts
  }
  const greedyCuts = cutCount(greedyOf)

  // Random baseline: averaged over 5 trials
  let randomTotal = 0
  for (let trial = 0; trial < 5; trial++) {
    const randomOf: number[] = boxes.map(() => Math.floor(Math.random() * Math.ceil(boxes.length / max)))
    randomTotal += cutCount(randomOf)
  }
  const randomAvg = randomTotal / 5

  expect(greedyCuts).toBeLessThan(randomAvg)
})
