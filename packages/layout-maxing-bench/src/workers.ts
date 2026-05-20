// Worker pool — same pattern as packages/layout-maxing-cli/src/index.ts.
// One pool per run; tear down after.

import { cpus } from 'node:os'
import Worker from 'web-worker'
import type { Config, Fitness } from 'layout-maxing'

export interface Pool {
  cpus: number
  getFitness: (layouts: unknown, lines: unknown, cfg: unknown) => Promise<Fitness>
  init: (cfg: Config) => void
  terminate: () => void
}

export function makePool(requested = 0): Pool {
  const count = requested > 0 ? requested : Math.max(2, cpus().length - 1)
  const workers = Array.from({ length: count }).map(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url).href, { type: 'module' })
    const info: { worker: Worker; resolve?: (value: Fitness) => void } = { worker }
    worker.onmessage = (e: MessageEvent) => {
      if (info.resolve) {
        info.resolve(e.data)
        info.resolve = undefined
        runNext()
      }
    }
    return info
  })
  const queue: { input: unknown; resolve: (value: Fitness) => void }[] = []

  function runNext() {
    if (!queue.length) return
    const free = workers.find((w) => !w.resolve)
    if (!free) return
    const next = queue.shift()!
    free.resolve = next.resolve
    free.worker.postMessage(next.input)
  }

  return {
    cpus: count,
    init(cfg) {
      for (const { worker } of workers) worker.postMessage({ type: 'init', cfg })
    },
    getFitness(layouts, lines, _cfg) {
      return new Promise<Fitness>((resolve) => {
        queue.push({ input: [layouts, lines], resolve })
        runNext()
      })
    },
    terminate() {
      for (const { worker } of workers) worker.terminate()
    },
  }
}
