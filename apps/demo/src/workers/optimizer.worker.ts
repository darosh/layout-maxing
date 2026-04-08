import {
  main,
  toSvg,
  defaultConfig,
  createInitialLayouts,
  applyBestLayout,
  fillDepths,
  stripOrphans,
} from 'layout-maxing'
import type { RNBO, Config, BoxLayout, Line, Fitness } from 'layout-maxing'

type Position = { id: string; x: number; y: number }
type TopEntry = { score: number; svg: string; fitness: Fitness; positions: Position[] }

type ProgressMsg = {
  type: 'progress'
  evalCount: number
  generation: number
  elapsed: number
  bestScore: number | null
  gen1stScore: number | null
  gen2ndScore: number | null
  genLastScore: number | null
  bestFitness: Fitness | null
  stopIn: number
  svg: string | null
  top: TopEntry[] | null
  currentGenTop: TopEntry[] | null
  layouts: BoxLayout[] | null
}
type OriginalMsg = {
  type: 'original'
  svg: string
  fitness: Fitness
  positions: Position[]
  layouts: BoxLayout[]
}
type DoneMsg = {
  type: 'done'
  svg: string
  top: TopEntry[]
  currentGenTop: TopEntry[]
  rnbo: RNBO
  layouts: BoxLayout[]
}
type ErrorMsg = { type: 'error'; message: string; stack?: string }

type WorkerMsg = OriginalMsg | ProgressMsg | DoneMsg | ErrorMsg

let stopped = false
let paused = false
const resumeResolvers: (() => void)[] = []

self.addEventListener('message', (e: MessageEvent) => {
  const msg = e.data
  if (msg?.type === 'stop') stopped = true
  if (msg?.type === 'pause') paused = true
  if (msg?.type === 'resume') {
    paused = false
    for (const resolve of resumeResolvers) resolve()
    resumeResolvers.length = 0
  }
})

function waitUntilResumed(): Promise<void> {
  if (!paused) return Promise.resolve()
  return new Promise<void>((resolve) => {
    resumeResolvers.push(resolve)
  })
}

function createFitnessWorkerPool() {
  const count = Math.max(2, (navigator.hardwareConcurrency || 4) - 1)
  const fitnessWorkers = Array.from({ length: count }).map(() => {
    const w = new Worker(new URL('./fitness.worker.ts', import.meta.url), { type: 'module' })
    const info: { worker: Worker; resolve?: (f: Fitness) => void } = { worker: w }
    w.onmessage = (e: MessageEvent<Fitness>) => {
      if (info.resolve) {
        info.resolve(e.data)
        info.resolve = undefined
        runNext()
      }
    }
    return info
  })

  const queue: { input: [BoxLayout[], Line[], Config]; resolve: (f: Fitness) => void }[] = []

  function runNext() {
    if (!queue.length) return
    const free = fitnessWorkers.find((w) => !w.resolve)
    if (!free) return
    const next = queue.shift()!
    free.resolve = next.resolve
    free.worker.postMessage([next.input[0], next.input[1], next.input[2]])
  }

  function getFitness(layouts: BoxLayout[], lines: Line[], cfg: Config): Promise<Fitness> {
    return new Promise((resolve) => {
      queue.push({ input: [layouts, lines, cfg], resolve })
      runNext()
    })
  }

  function terminate() {
    for (const { worker } of fitnessWorkers) worker.terminate()
  }

  return { getFitness, terminate, count }
}

function cloneForSvg(layouts: BoxLayout[]): BoxLayout[] {
  return layouts.map(({ children: _c, parents: _p, ...rest }) => rest as BoxLayout)
}

self.onmessage = async (e: MessageEvent) => {
  // Control messages (pause/resume/stop) are handled by the addEventListener above
  if (e.data?.type) return

  const {
    rnbo,
    cfg,
    progressInterval = 200,
    svgInterval: _svgInterval = 1000,
    topN = 10,
    initialPositions,
  } = e.data as {
    rnbo: RNBO
    cfg: Config
    progressInterval?: number
    svgInterval?: number // unused, kept for API compat
    topN?: number
    initialPositions?: { id: string; x: number; y: number }[]
  }

  if (initialPositions?.length) {
    const posMap = new Map(initialPositions.map((p) => [p.id, p]))
    for (const b of rnbo.patcher.boxes) {
      const pos = posMap.get(b.box.id)
      if (pos) {
        b.box.patching_rect[0] = Math.round(pos.x)
        b.box.patching_rect[1] = Math.round(pos.y)
      }
    }
  }

  stopped = false
  paused = false
  resumeResolvers.length = 0

  const c = { ...defaultConfig, ...cfg }
  const lines = rnbo.patcher.lines
  const pool = createFitnessWorkerPool()

  let evalCount = 0
  let bestScore: number | null = null
  let bestFitness: Fitness | null = null
  let bestLayouts: BoxLayout[] | null = null
  let lastProgressTime = 0
  let stopIn = c.stop
  const startTime = Date.now()

  // Top-N candidates by score (ascending)
  const top: { score: number; layouts: BoxLayout[]; fitness: Fitness }[] = []
  // Sliding window of current population (last popSize evaluations)
  const currentPop: { score: number; layouts: BoxLayout[]; fitness: Fitness }[] = []

  function updateTop(score: number, layouts: BoxLayout[], fitness: Fitness) {
    const worst = top.length >= topN ? top[top.length - 1]!.score : Infinity
    if (score < worst || top.length < topN) {
      // Avoid near-duplicate scores (within 0.01%)
      const dup = top.some((t) => Math.abs(t.score - score) / score < 0.0001)
      if (!dup) {
        top.push({ score, layouts: cloneForSvg(layouts), fitness })
        top.sort((a, b) => a.score - b.score)
        if (top.length > topN) top.pop()
      }
    }
  }

  function buildTopEntries(): TopEntry[] {
    return top.map((t) => ({
      score: t.score,
      svg: toSvg(t.layouts, lines, cfg, rnbo.patcher.boxgroups),
      fitness: t.fitness,
      positions: t.layouts.map((l) => ({ id: l.id, x: l.x, y: l.y })),
    }))
  }

  function buildCurrentGenEntries(): TopEntry[] {
    return [...currentPop]
      .sort((a, b) => a.score - b.score)
      .slice(0, topN)
      .map((t) => ({
        score: t.score,
        svg: toSvg(t.layouts, lines, cfg, rnbo.patcher.boxgroups),
        fitness: t.fitness,
        positions: t.layouts.map((l) => ({ id: l.id, x: l.x, y: l.y })),
      }))
  }

  const post = (msg: WorkerMsg) => self.postMessage(msg)

  if (c.logInfo) console.log(`[optimizer] starting — ${pool.count} fitness workers`)

  // Build initial layouts the same way main() does, honoring ignoreOrphans
  // so orphans never reach SVG / positions / export.
  function buildLayoutsForView(): BoxLayout[] {
    let ls = createInitialLayouts(rnbo.patcher)
    if (c.ignoreOrphans) {
      fillDepths(ls, lines)
      ls = stripOrphans(ls)
      fillDepths(ls, lines)
    }
    return cloneForSvg(ls)
  }

  // Evaluate and emit the original (pre-optimization) layout
  try {
    const origLayouts = buildLayoutsForView()
    const origFitness = await pool.getFitness(origLayouts, lines, cfg)
    post({
      type: 'original',
      svg: toSvg(origLayouts, lines, cfg, rnbo.patcher.boxgroups),
      fitness: origFitness,
      positions: origLayouts.map((l) => ({ id: l.id, x: l.x, y: l.y })),
      layouts: origLayouts,
    })
  } catch (err) {
    // Non-fatal — original evaluation may fail if rnbo has no boxes
    console.error('[optimizer] original evaluation failed:', err)
  }

  try {
    const bestIndividual = await main(
      rnbo,
      async (layouts: BoxLayout[], batchLines: Line[], batchCfg: Config) => {
        await waitUntilResumed()
        if (stopped) throw new Error('stopped')
        const result = await pool.getFitness(layouts, batchLines, batchCfg)
        evalCount++

        // Track best / worst
        if (bestScore === null || result.score < bestScore) {
          bestScore = result.score
          bestFitness = result
          bestLayouts = cloneForSvg(layouts)
        }
        // Track top-N
        updateTop(result.score, layouts, result)
        // Sliding window for current population
        currentPop.push({ score: result.score, layouts: cloneForSvg(layouts), fitness: result })
        if (currentPop.length > c.popSize) currentPop.shift()
        const now = Date.now()

        // Progress + SVG update, every progressInterval ms
        if (now - lastProgressTime >= progressInterval) {
          lastProgressTime = now
          const generation = Math.floor(evalCount / c.popSize)
          const elapsed = now - startTime
          const sortedGen = [...currentPop].sort((a, b) => a.score - b.score)
          const gen1stScore = sortedGen[0]?.score ?? null
          const gen2ndScore = sortedGen[1]?.score ?? null
          const genLastScore = sortedGen[sortedGen.length - 1]?.score ?? null
          const svgNow = bestLayouts ? toSvg(bestLayouts, lines, cfg, rnbo.patcher.boxgroups) : null
          post({
            type: 'progress',
            evalCount,
            generation,
            elapsed,
            bestScore,
            gen1stScore,
            gen2ndScore,
            genLastScore,
            bestFitness,
            stopIn,
            svg: svgNow,
            top: buildTopEntries(),
            currentGenTop: buildCurrentGenEntries(),
            layouts: bestLayouts ? [...bestLayouts] : null,
          })
        }

        return result
      },
      undefined,
      cfg,
      (stop: number) => {
        stopIn = stop
      },
      c.logProgress ? console.log : undefined,
      c.logInfo ? console.log : undefined,
    )

    pool.terminate()
    // Send final progress update so the panel reflects the true end state
    const finalElapsed = Date.now() - startTime
    const sortedFinal = [...currentPop].sort((a, b) => a.score - b.score)
    post({
      type: 'progress',
      evalCount,
      generation: Math.floor(evalCount / c.popSize),
      elapsed: finalElapsed,
      bestScore,
      gen1stScore: sortedFinal[0]?.score ?? null,
      gen2ndScore: sortedFinal[1]?.score ?? null,
      genLastScore: sortedFinal[sortedFinal.length - 1]?.score ?? null,
      bestFitness,
      stopIn,
      svg: bestLayouts ? toSvg(bestLayouts, lines, cfg, rnbo.patcher.boxgroups) : null,
      top: buildTopEntries(),
      currentGenTop: buildCurrentGenEntries(),
      layouts: bestLayouts ? [...bestLayouts] : null,
    })
    applyBestLayout(rnbo, bestIndividual, c)
    const finalLayouts = buildLayoutsForView()
    const svg = toSvg(finalLayouts, lines, cfg, rnbo.patcher.boxgroups)
    if (c.logInfo)
      console.log(
        `[optimizer] done — ${evalCount} evals, best=${bestScore == null ? 'n/a' : (bestScore as number).toFixed(2)}`,
      )
    post({
      type: 'done',
      svg,
      top: buildTopEntries(),
      currentGenTop: buildCurrentGenEntries(),
      rnbo,
      layouts: finalLayouts,
    })
  } catch (err) {
    pool.terminate()
    if (err instanceof Error && err.message === 'stopped') {
      if (c.logInfo) console.log(`[optimizer] stopped at ${evalCount} evals`)
      // main() threw before applyBestLayout — apply manually
      const layouts = bestLayouts as BoxLayout[] | null
      if (layouts) applyBestLayout(rnbo, layouts, c)
      const svg = layouts ? toSvg(layouts, lines, cfg, rnbo.patcher.boxgroups) : ''
      post({
        type: 'done',
        svg,
        top: buildTopEntries(),
        currentGenTop: buildCurrentGenEntries(),
        rnbo,
        layouts: layouts ?? [],
      })
    } else {
      console.error('[optimizer] fatal:', err)
      post({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })
    }
  }
}
