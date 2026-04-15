import { defineStore } from 'pinia'
import { ref, computed, toRaw, watch } from 'vue'
import { defaultConfig, applyBestLayout } from 'layout-maxing'
import type { RNBO, Config, Fitness, Box, Line, GenerationSnapshot, RunMonitor } from 'layout-maxing'

const CONFIG_KEY = 'layout-maxing-config'
const RUN_KEY = 'layout-maxing-run'

export type Status = 'idle' | 'running' | 'paused' | 'done' | 'error'

export interface TopEntry {
  score: number
  svg: string
  fitness: Fitness
  positions: { id: string; x: number; y: number }[]
  mutations: Record<string, number> // summed _mutations counts across all boxes
  popId?: number
  popGen?: number
  prevId?: number
  prevGen?: number
  passNum?: number
}

export type Selection = { kind: 'original' } | { kind: 'allTime'; index: number } | { kind: 'current'; index: number } | { kind: 'pass'; index: number }

export const useOptimizerStore = defineStore('optimizer', () => {
  const rnbo = ref<RNBO | null>(null)
  const fileName = ref('')
  const inputSource = ref<'file' | 'clipboard' | null>(null)
  // Load persisted config from localStorage
  const savedConfig = (() => {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null')
    } catch {
      return null
    }
  })()
  const config = ref<Config>({ ...defaultConfig, ...(savedConfig ?? undefined) })

  // Load persisted run settings from localStorage
  const savedRun = (() => {
    try {
      return JSON.parse(localStorage.getItem(RUN_KEY) ?? 'null')
    } catch {
      return null
    }
  })()

  // UI-only run settings (not part of Config)
  const progressInterval = ref<number>(savedRun?.progressInterval ?? 200)
  const topN = ref<number>(savedRun?.topN ?? 15)
  const displayMode = ref<'allTime' | 'current' | 'passes'>(savedRun?.displayMode ?? 'allTime')
  const allTimeTop = computed(() => displayMode.value === 'allTime')
  const showStats = ref<boolean>(savedRun?.showStats ?? false)
  const showGrid = ref<boolean>(savedRun?.showGrid ?? false)
  // Persist config changes
  watch(
    config,
    (val) => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  // Persist run settings changes
  watch([progressInterval, topN, displayMode, showStats, showGrid], () => {
    localStorage.setItem(
      RUN_KEY,
      JSON.stringify({
        progressInterval: progressInterval.value,
        topN: topN.value,
        displayMode: displayMode.value,
        showStats: showStats.value,
        showGrid: showGrid.value,
      }),
    )
  })

  const isConfigDefault = computed(() => (Object.keys(defaultConfig) as (keyof Config)[]).every((k) => config.value[k] === defaultConfig[k]))

  const status = ref<Status>('idle')
  const progress = ref({
    evalCount: 0,
    generation: 0,
    elapsed: 0,
    bestScore: null as number | null,
    gen1stScore: null as number | null,
    gen2ndScore: null as number | null,
    genLastScore: null as number | null,
    bestFitness: null as Fitness | null,
    stopIn: defaultConfig.stop,
    passNum: 1,
    numPasses: 1,
  })
  const top = ref<TopEntry[]>([])
  const currentGenTop = ref<TopEntry[]>([])
  const passBest = ref<TopEntry[]>([])
  const snapshots = ref<GenerationSnapshot[]>([])
  const runMonitor = ref<RunMonitor | null>(null)
  const resultRnbo = ref<RNBO | null>(null)
  const error = ref<string | null>(null)

  // Original (pre-optimization) layout
  const originalSvg = ref('')
  const originalFitness = ref<Fitness | null>(null)
  const originalPositions = ref<{ id: string; x: number; y: number }[]>([])
  const originalLayouts = ref<Box[]>([])

  // Selected entry
  const selection = ref<Selection>({ kind: 'allTime', index: 0 })

  // Increments on every run start — lets renderers suppress transitions for the first frame
  const runId = ref(0)

  let worker: Worker | null = null

  const canStart = computed(() => rnbo.value !== null && status.value !== 'running' && status.value !== 'paused')
  const totalEvals = computed(() => (config.value.generations ?? defaultConfig.generations) * (config.value.popSize ?? defaultConfig.popSize))
  const progressPercent = computed(() => {
    if (totalEvals.value === 0) return 0
    return Math.min(100, (progress.value.evalCount / totalEvals.value) * 100)
  })
  const eta = computed(() => {
    const { evalCount, elapsed } = progress.value
    if (evalCount === 0 || elapsed === 0) return null
    const rate = evalCount / elapsed // evals per ms
    const remaining = totalEvals.value - evalCount
    return Math.max(0, remaining / rate) // ms
  })

  const passesBest = computed<TopEntry[]>(() => passBest.value.slice(0, topN.value))

  function resolveEntry(sel: Selection): TopEntry | null {
    if (sel.kind === 'allTime') return top.value[sel.index] ?? null
    if (sel.kind === 'current') return currentGenTop.value[sel.index] ?? null
    if (sel.kind === 'pass') return passesBest.value[sel.index] ?? null
    return null
  }

  // Switch between all-time/current-gen/passes mode
  function switchMode(mode: 'allTime' | 'current' | 'passes') {
    displayMode.value = mode
    if (mode === 'allTime') selection.value = { kind: 'allTime', index: 0 }
    else if (mode === 'current') selection.value = { kind: 'current', index: 0 }
    else selection.value = { kind: 'pass', index: 0 }
  }

  watch(topN, (val) => {
    const sel = selection.value
    if (sel.kind === 'allTime' && sel.index >= val) {
      selection.value = { kind: 'allTime', index: Math.max(0, val - 1) }
    } else if (sel.kind === 'current' && sel.index >= val) {
      selection.value = { kind: 'current', index: Math.max(0, val - 1) }
    } else if (sel.kind === 'pass' && sel.index >= val) {
      selection.value = { kind: 'pass', index: Math.max(0, val - 1) }
    }
  })

  const displayedSvg = computed(() => {
    const sel = selection.value
    if (sel.kind === 'original') return originalSvg.value
    return resolveEntry(sel)?.svg ?? ''
  })

  const displayedLayouts = computed<Box[]>(() => {
    const sel = selection.value
    if (sel.kind === 'original') return originalLayouts.value
    const entry = resolveEntry(sel)
    if (!entry) return []
    // Merge stored positions back into the original layout templates
    const posMap = new Map(entry.positions.map((p) => [p.id, p]))
    return originalLayouts.value.map((box) => {
      const pos = posMap.get(box.id)
      return pos ? { ...box, x: pos.x, y: pos.y } : box
    })
  })

  const lines = computed<Line[]>(() => (rnbo.value?.patcher.lines ?? []) as Line[])

  const displayedFitness = computed<Fitness | null>(() => {
    const sel = selection.value
    if (sel.kind === 'original') return originalFitness.value
    return resolveEntry(sel)?.fitness ?? null
  })

  const displayedEntry = computed<TopEntry | null>(() => {
    const sel = selection.value
    if (sel.kind === 'original') return null
    return resolveEntry(sel) ?? null
  })

  const canExport = computed(() => selection.value.kind === 'original' || top.value.length > 0 || resultRnbo.value !== null)

  function loadFile(content: string | RNBO, name: string, source: 'file' | 'clipboard' = 'file') {
    const wasRunning = status.value === 'running' || status.value === 'paused'
    if (wasRunning) stopOptimization()
    try {
      rnbo.value = typeof content === 'string' ? (JSON.parse(content) as RNBO) : content
      fileName.value = name
      inputSource.value = source
      resultRnbo.value = null
      status.value = 'idle'
      error.value = null
      progress.value = {
        evalCount: 0,
        generation: 0,
        elapsed: 0,
        bestScore: null,
        gen1stScore: null,
        gen2ndScore: null,
        genLastScore: null,
        bestFitness: null,
        stopIn: defaultConfig.stop,
        passNum: 1,
        numPasses: 1,
      }
    } catch {
      error.value = 'Invalid JSON file'
      return
    }
    if (rnbo.value) startOptimization()
  }

  async function loadFixture() {
    try {
      const res = await fetch('/fixture/test.maxpat')
      if (!res.ok) throw new Error('Failed to fetch fixture')
      const text = await res.text()
      loadFile(text, 'test.maxpat')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load fixture'
    }
  }

  function startOptimization(initialPositions?: { id: string; x: number; y: number }[]) {
    if (!rnbo.value || status.value === 'running') return
    stopOptimization()

    status.value = 'running'
    error.value = null
    resultRnbo.value = null
    snapshots.value = []
    passBest.value = []
    runMonitor.value = null
    runId.value++
    progress.value = {
      evalCount: 0,
      generation: 0,
      elapsed: 0,
      bestScore: null,
      gen1stScore: null,
      gen2ndScore: null,
      genLastScore: null,
      bestFitness: null,
      stopIn: config.value.stop ?? defaultConfig.stop,
      passNum: 1,
      numPasses: config.value.passes ?? 1,
    }
    worker = new Worker(new URL('../workers/optimizer.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      switch (msg.type) {
        case 'original':
          originalSvg.value = msg.svg
          originalFitness.value = msg.fitness
          originalPositions.value = msg.positions
          originalLayouts.value = msg.layouts ?? []
          break
        case 'progress':
          progress.value = {
            evalCount: msg.evalCount,
            generation: msg.generation,
            elapsed: msg.elapsed,
            bestScore: msg.bestScore,
            gen1stScore: msg.gen1stScore ?? null,
            gen2ndScore: msg.gen2ndScore ?? null,
            genLastScore: msg.genLastScore ?? null,
            bestFitness: msg.bestFitness ?? null,
            stopIn: msg.stopIn ?? progress.value.stopIn,
            passNum: msg.passNum ?? progress.value.passNum,
            numPasses: msg.numPasses ?? progress.value.numPasses,
          }
          if (msg.top?.length) top.value = msg.top
          if (msg.passBest?.length) passBest.value = msg.passBest
          if (msg.currentGenTop?.length) currentGenTop.value = msg.currentGenTop
          if (msg.snapshots?.length) snapshots.value = msg.snapshots
          break
        case 'svg':
          if (msg.top?.length) top.value = msg.top
          if (msg.passBest?.length) passBest.value = msg.passBest
          if (msg.currentGenTop?.length) currentGenTop.value = msg.currentGenTop
          break
        case 'done':
          status.value = 'done'
          if (msg.top?.length) top.value = msg.top
          if (msg.passBest?.length) passBest.value = msg.passBest
          if (msg.currentGenTop?.length) currentGenTop.value = msg.currentGenTop
          if (msg.runMonitor) runMonitor.value = msg.runMonitor
          resultRnbo.value = msg.rnbo ?? null
          worker?.terminate()
          worker = null
          break
        case 'error':
          console.error('[optimizer] worker error:', msg.message, msg.stack ?? '')
          status.value = 'error'
          error.value = msg.message
          worker?.terminate()
          worker = null
          break
      }
    }

    worker.onerror = (e) => {
      console.error('[optimizer] worker.onerror:', e.message, e)
      status.value = 'error'
      error.value = e.message
      worker?.terminate()
      worker = null
    }

    worker.postMessage({
      rnbo: toRaw(rnbo.value),
      cfg: toRaw(config.value),
      progressInterval: progressInterval.value,
      topN: topN.value,
      initialPositions,
    })
  }

  function startReOptimization() {
    const bestPositions = toRaw(top.value[0])?.positions
    if (!bestPositions) return
    startOptimization(bestPositions)
  }

  function stopOptimization() {
    if (worker) {
      worker.postMessage({ type: 'stop' })
      worker.terminate()
      worker = null
    }
    if (status.value === 'running' || status.value === 'paused') {
      status.value = 'idle'
    }
  }

  function pauseOptimization() {
    if (worker && status.value === 'running') {
      worker.postMessage({ type: 'pause' })
      status.value = 'paused'
    }
  }

  function resumeOptimization() {
    if (worker && status.value === 'paused') {
      worker.postMessage({ type: 'resume' })
      status.value = 'running'
    }
  }

  function resetConfig() {
    localStorage.removeItem(CONFIG_KEY)
    config.value = { ...defaultConfig }
  }

  function applyPositions(positions: { id: string; x: number; y: number }[]): RNBO {
    const clone = JSON.parse(JSON.stringify(toRaw(rnbo.value))) as RNBO
    // applyBestLayout only reads id/x/y on each layout entry, so passing
    // these minimal records is safe.
    const layouts = positions.map((p) => ({ ...p })) as unknown as Box[]
    const c = { ...defaultConfig, ...toRaw(config.value) } as Required<Config>
    applyBestLayout(clone, layouts, c)
    return clone
  }

  function getExportRnbo(): RNBO | null {
    const sel = selection.value
    if (sel.kind === 'original') return toRaw(rnbo.value)
    const entry = resolveEntry(sel)
    if (!entry) return null
    return applyPositions(entry.positions)
  }

  function getExportClipboard() {
    const rnbo = getExportRnbo()

    return {
      appversion: rnbo?.patcher.appversion,
      boxes: rnbo?.patcher.boxes,
      lines: rnbo?.patcher.lines,
    }
  }

  return {
    rnbo,
    fileName,
    inputSource,
    config,
    progressInterval,
    runId,
    topN,
    allTimeTop,
    displayMode,
    passesBest,
    snapshots,
    runMonitor,
    switchMode,
    isConfigDefault,
    status,
    progress,
    top,
    currentGenTop,
    resultRnbo,
    error,
    canStart,
    totalEvals,
    progressPercent,
    eta,
    selection,
    originalSvg,
    originalFitness,
    displayedSvg,
    displayedFitness,
    displayedEntry,
    displayedLayouts,
    lines,
    canExport,
    getExportRnbo,
    getExportClipboard,
    loadFile,
    loadFixture,
    startOptimization,
    startReOptimization,
    stopOptimization,
    pauseOptimization,
    resumeOptimization,
    resetConfig,
    showStats,
    showGrid,
  }
})
