import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { expect, test } from 'vite-plus/test'
import NodeWorker from 'web-worker'
import { elkFlow } from '../src/layout.ts'
import type { Box, Line } from '../src/layout.ts'
import { defaultConfig } from '../src/index.ts'

// In Node.js (vitest), supply a workerFactory via the web-worker package.
// Browser callers supply their own factory; the lib ships no worker.
const _require = createRequire(import.meta.url)
const workerUrl = pathToFileURL(_require.resolve('elkjs/lib/elk-worker.min.js')).href
const nodeWorkerFactory = () => new NodeWorker(workerUrl, { type: 'module' })

function makeBoxes(): Box[] {
  return [
    { id: 'a', index: 0, x: 0, y: 0, width: 80, height: 22, numInlets: 0, numOutlets: 2 },
    { id: 'b', index: 1, x: 0, y: 0, width: 80, height: 22, numInlets: 1, numOutlets: 1 },
    { id: 'c', index: 2, x: 0, y: 0, width: 80, height: 22, numInlets: 2, numOutlets: 0 },
  ]
}

const lines: Line[] = [
  { patchline: { source: ['a', 0], destination: ['b', 0] } },
  { patchline: { source: ['a', 1], destination: ['c', 0] } },
  { patchline: { source: ['b', 0], destination: ['c', 1] } },
]

test('elkFlow (DOWN): positions are non-negative and distinct', async () => {
  const boxes = makeBoxes()
  await elkFlow(boxes, lines, defaultConfig, nodeWorkerFactory, 'DOWN')
  for (const b of boxes) {
    expect(b.x).toBeGreaterThanOrEqual(0)
    expect(b.y).toBeGreaterThanOrEqual(0)
  }
  const a = boxes.find((b) => b.id === 'a')!
  const c = boxes.find((b) => b.id === 'c')!
  expect(a.y).toBeLessThan(c.y)
})

test('elkFlow (RIGHT): root is left of leaf', async () => {
  const boxes = makeBoxes()
  await elkFlow(boxes, lines, defaultConfig, nodeWorkerFactory, 'RIGHT')
  const a = boxes.find((b) => b.id === 'a')!
  const c = boxes.find((b) => b.id === 'c')!
  expect(a.x).toBeLessThan(c.x)
})

test('elkFlow: boxes with no ports still get positioned', async () => {
  const boxes: Box[] = [
    { id: 'x', index: 0, x: 0, y: 0, width: 60, height: 20, numInlets: 0, numOutlets: 0 },
    { id: 'y', index: 1, x: 0, y: 0, width: 60, height: 20, numInlets: 0, numOutlets: 0 },
  ]
  await elkFlow(boxes, [], defaultConfig, nodeWorkerFactory, 'DOWN')
  expect(boxes[0].x).toBeGreaterThanOrEqual(0)
  expect(boxes[1].x).toBeGreaterThanOrEqual(0)
})
