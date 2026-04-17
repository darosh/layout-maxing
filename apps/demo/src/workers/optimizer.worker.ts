import { main, toSvg, defaultConfig, createInitialLayouts, applyBestLayout, fillDepths, stripOrphans, preserveGroupMembers, stampGroupIdx } from 'layout-maxing'
import type { RNBO, Config, Box, Line, Fitness, GenerationSnapshot, RunMonitor, Population } from 'layout-maxing'

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
  passNum: number
  numPasses: number
  svg: string | null
  top: TopEntry[] | null
  passBest: TopEntry[] | null
  currentGenTop: TopEntry[] | null
  layouts: Box[] | null
  snapshots: GenerationSnapshot[] | null
}
type OriginalMsg = {
  type: 'original'
  svg: string
  fitness: Fitness
  positions: Position[]
  layouts: Box[]
}
type DoneMsg = {
  type: 'done'
  svg: string
  top: TopEntry[]
  passBest: TopEntry[]
  currentGenTop: TopEntry[]
  rnbo: RNBO
  layouts: Box[]
  runMonitor?: RunMonitor
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

function createFitnessWorkerPool(workers = 0) {
  const count = workers > 0 ? workers : Math.max(2, (navigator.hardwareConcurrency || 4) - 1)
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

  const queue: { input: [Box[], Line[], Config]; resolve: (f: Fitness) => void }[] = []

  function runNext() {
    if (!queue.length) return
    const free = fitnessWorkers.find((w) => !w.resolve)
    if (!free) return
    const next = queue.shift()!
    free.resolve = next.resolve
    free.worker.postMessage([next.input[0], next.input[1], next.input[2]])
  }

  function getFitness(layouts: Box[], lines: Line[], cfg: Config): Promise<Fitness> {
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

function cloneForSvg(layouts: Box[]): Box[] {
  return layouts.map(({ children: _c, parents: _p, ...rest }) => rest as Box)
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
  const pool = createFitnessWorkerPool(cfg.workers)

  let evalCount = 0
  let bestScore: number | null = null
  let bestFitness: Fitness | null = null
  let bestLayouts: Box[] | null = null
  let lastProgressTime = 0
  let finalRunMonitor: RunMonitor | undefined
  let stopIn = c.stop
  const startTime = Date.now()
  const snapshotBuffer: GenerationSnapshot[] = []
  const MAX_SNAPSHOTS = (240 - 40 - 40) * 3
  let currentGen = 0
  let currentPassNum = 1
  let currentNumPasses = c.passes ?? 1

  // Top-N candidates by score (ascending)
  const top: {
    score: number
    layouts: Box[]
    fitness: Fitness
    popId?: number
    popGen?: number
    prevId?: number
    prevGen?: number
    origins?: string[]
    passNum?: number
  }[] = []
  // Best entry per pass (independent of topN — never evicted)
  const passBestMap = new Map<number, (typeof top)[0]>()
  // Sliding window of current population (last popSize evaluations)
  const currentPop: {
    score: number
    layouts: Box[]
    fitness: Fitness
    popId?: number
    popGen?: number
    prevId?: number
    prevGen?: number
    origins?: string[]
    passNum?: number
  }[] = []

  function updateTop(
    score: number,
    layouts: Box[],
    fitness: Fitness,
    popId?: number,
    popGen?: number,
    prevId?: number,
    prevGen?: number,
    origins?: string[],
    passNum?: number,
  ) {
    const worst = top.length >= topN ? top[top.length - 1]!.score : Infinity
    if (score < worst || top.length < topN) {
      // Avoid near-duplicate scores (within 0.01%)
      const dup = top.some((t) => Math.abs(t.score - score) / score < 0.0001)
      if (!dup) {
        top.push({
          score,
          layouts: cloneForSvg(layouts),
          fitness,
          popId,
          popGen,
          prevId,
          prevGen,
          origins,
          passNum,
        })
        top.sort((a, b) => a.score - b.score)
        if (top.length > topN) top.pop()
      }
    }
    // Track best per pass independently (never evicted by topN)
    const p = passNum ?? 1
    const prev = passBestMap.get(p)
    if (prev === undefined || score < prev.score) {
      passBestMap.set(p, { score, layouts: cloneForSvg(layouts), fitness, popId, popGen, prevId, prevGen, origins, passNum })
    }
  }

  function aggregateMutations(layouts: Box[]): Record<string, number> {
    const totals: Record<string, number> = {}
    for (const box of layouts) {
      if (!box._mutations) continue
      for (const [k, v] of Object.entries(box._mutations)) {
        totals[k] = (totals[k] ?? 0) + v
      }
    }
    return totals
  }

  function buildTopEntries(): TopEntry[] {
    return top.map((t) => ({
      score: t.score,
      svg: toSvg(t.layouts, lines, cfg, rnbo.patcher.boxgroups),
      fitness: t.fitness,
      positions: t.layouts.map((l) => ({ id: l.id, x: l.x, y: l.y })),
      mutations: aggregateMutations(t.layouts),
      popId: t.popId,
      popGen: t.popGen,
      prevId: t.prevId,
      prevGen: t.prevGen,
      origins: t.origins,
      passNum: t.passNum,
    }))
  }

  function buildPassBestEntries(): TopEntry[] {
    return [...passBestMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, t]) => ({
        score: t.score,
        svg: toSvg(t.layouts, lines, cfg, rnbo.patcher.boxgroups),
        fitness: t.fitness,
        positions: t.layouts.map((l) => ({ id: l.id, x: l.x, y: l.y })),
        mutations: aggregateMutations(t.layouts),
        popId: t.popId,
        popGen: t.popGen,
        prevId: t.prevId,
        prevGen: t.prevGen,
        origins: t.origins,
        passNum: t.passNum,
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
        mutations: aggregateMutations(t.layouts),
        popId: t.popId,
        popGen: t.popGen,
        prevId: t.prevId,
        prevGen: t.prevGen,
        origins: t.origins,
        passNum: t.passNum,
      }))
  }

  const post = (msg: WorkerMsg) => self.postMessage(msg)

  if (c.logInfo) console.log(`[optimizer] starting — ${pool.count} fitness workers`)

  // Build initial layouts the same way main() does, honoring ignoreOrphans
  // so orphans never reach SVG / positions / export.
  function buildLayoutsForView(): Box[] {
    let ls = createInitialLayouts(rnbo.patcher)
    if (c.keepGroups) stampGroupIdx(ls, rnbo.patcher.boxgroups)
    if (c.ignoreOrphans) {
      fillDepths(ls, lines)
      if (c.keepGroups) preserveGroupMembers(ls, rnbo.patcher.boxgroups)
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

  const elkWorker = () => {
    const url = new URL('elkjs/lib/elk-worker.min.js', import.meta.url)
    return new Worker(url, { type: 'classic' })
  }

  const onMonitorEnd = (monitor: RunMonitor) => {
    finalRunMonitor = monitor
  }

  const getFitness = async (layouts: Box[], batchLines: Line[], batchCfg: Config) => {
    await waitUntilResumed()
    if (stopped) throw new Error('stopped')

    return await pool.getFitness(layouts, batchLines, batchCfg)
  }

  function updateUi({ fitness, layouts }: Required<Population>) {
    evalCount++

    // Track best / worst
    if (bestScore === null || fitness.score < bestScore) {
      bestScore = fitness.score
      bestFitness = fitness
      bestLayouts = cloneForSvg(layouts)
    }

    // Track top-N
    const popId: number | undefined = (layouts as any)._popId
    const popGen: number | undefined = (layouts as any)._popGen
    const prevId: number | undefined = (layouts as any)._popPrevId
    const prevGen: number | undefined = (layouts as any)._popPrevGen
    const origins: string[] | undefined = (layouts as any)._popOrigins

    updateTop(fitness.score, layouts, fitness, popId, popGen, prevId, prevGen, origins, currentPassNum)

    // Sliding window for current population
    currentPop.push({
      score: fitness.score,
      layouts: cloneForSvg(layouts),
      fitness: fitness,
      popId,
      popGen,
      prevId,
      prevGen,
      origins,
      passNum: currentPassNum,
    })

    if (currentPop.length > c.popSize) currentPop.shift()

    const now = Date.now()

    // Progress + SVG update, every progressInterval ms
    if (now - lastProgressTime >= progressInterval) {
      lastProgressTime = now
      const generation = currentGen
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
        passNum: currentPassNum,
        numPasses: currentNumPasses,
        svg: svgNow,
        top: buildTopEntries(),
        passBest: buildPassBestEntries(),
        currentGenTop: buildCurrentGenEntries(),
        layouts: bestLayouts ? [...bestLayouts] : null,
        snapshots: snapshotBuffer.length ? [...snapshotBuffer] : null,
      })
    }
  }

  const onGenerationEnd = (stop: number, snapshot?: GenerationSnapshot, passNum?: number, numPasses?: number) => {
    if (snapshot?.population) {
      for (const p of snapshot.population) {
        updateUi(<Required<Population>>p)
      }

      snapshot.population = undefined
    }

    stopIn = stop
    if (passNum != null) currentPassNum = passNum
    if (numPasses != null) currentNumPasses = numPasses
    if (snapshot) {
      currentGen = snapshot.gen
      snapshotBuffer.push(snapshot)
      // Downsample: keep evenly-spaced subset when buffer grows too large
      if (snapshotBuffer.length > MAX_SNAPSHOTS * 1.2) {
        const keep = MAX_SNAPSHOTS
        const step = snapshotBuffer.length / keep
        const downsampled = Array.from({ length: keep }, (_, i) => <GenerationSnapshot>snapshotBuffer[Math.round(i * step)])
        snapshotBuffer.length = 0
        snapshotBuffer.push(...downsampled)
      }
    }
  }

  try {
    const bestIndividual = await main(
      rnbo,
      getFitness,
      undefined,
      cfg,
      onGenerationEnd,
      c.logProgress ? console.log : undefined,
      c.logInfo ? console.log : undefined,
      onMonitorEnd,
      elkWorker,
    )

    pool.terminate()
    // Send final progress update so the panel reflects the true end state
    const finalElapsed = Date.now() - startTime
    const sortedFinal = [...currentPop].sort((a, b) => a.score - b.score)
    post({
      type: 'progress',
      evalCount,
      generation: currentGen,
      elapsed: finalElapsed,
      bestScore,
      gen1stScore: sortedFinal[0]?.score ?? null,
      gen2ndScore: sortedFinal[1]?.score ?? null,
      genLastScore: sortedFinal[sortedFinal.length - 1]?.score ?? null,
      bestFitness,
      stopIn,
      passNum: currentPassNum,
      numPasses: currentNumPasses,
      svg: bestLayouts ? toSvg(bestLayouts, lines, cfg, rnbo.patcher.boxgroups) : null,
      top: buildTopEntries(),
      passBest: buildPassBestEntries(),
      currentGenTop: buildCurrentGenEntries(),
      layouts: bestLayouts ? [...bestLayouts] : null,
      snapshots: snapshotBuffer.length ? [...snapshotBuffer] : null,
    })
    applyBestLayout(rnbo, bestIndividual, c)
    const finalLayouts = buildLayoutsForView()
    const svg = toSvg(finalLayouts, lines, cfg, rnbo.patcher.boxgroups)
    if (c.logInfo) console.log(`[optimizer] done — ${evalCount} evals, best=${bestScore == null ? 'n/a' : (bestScore as number).toFixed(2)}`)
    post({
      type: 'done',
      svg,
      top: buildTopEntries(),
      passBest: buildPassBestEntries(),
      currentGenTop: buildCurrentGenEntries(),
      rnbo,
      layouts: finalLayouts,
      runMonitor: finalRunMonitor,
    })
  } catch (err) {
    pool.terminate()
    if (err instanceof Error && err.message === 'stopped') {
      if (c.logInfo) console.log(`[optimizer] stopped at ${evalCount} evals`)
      // main() threw before applyBestLayout — apply manually
      const layouts = bestLayouts as Box[] | null
      if (layouts) applyBestLayout(rnbo, layouts, c)
      const svg = layouts ? toSvg(layouts, lines, cfg, rnbo.patcher.boxgroups) : ''
      post({
        type: 'done',
        svg,
        top: buildTopEntries(),
        passBest: buildPassBestEntries(),
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
