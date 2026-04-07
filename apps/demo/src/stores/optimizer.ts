import { defineStore } from 'pinia'
import { ref, computed, toRaw, watch } from 'vue'
import { defaultConfig } from 'layout-maxing'
import type { RNBO, Config, Fitness } from 'layout-maxing'

const CONFIG_KEY = 'layout-maxing-config'
const RUN_KEY = 'layout-maxing-run'

export type Status = 'idle' | 'running' | 'paused' | 'done' | 'error'

export interface TopEntry {
  score: number
  svg: string
  fitness: Fitness
  positions: { id: string; x: number; y: number }[]
}

export type Selection =
  | { kind: 'live' }
  | { kind: 'original' }
  | { kind: 'best' }
  | { kind: 'allTime'; index: number }
  | { kind: 'current'; index: number }

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
  const svgInterval = ref<number>(savedRun?.svgInterval ?? 1000)
  const topN = ref<number>(savedRun?.topN ?? 15)
  const allTimeTop = ref<boolean>(savedRun?.allTimeTop ?? true)
  // Persist config changes
  watch(
    config,
    (val) => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  // Persist run settings changes
  watch([progressInterval, svgInterval, topN, allTimeTop], () => {
    localStorage.setItem(
      RUN_KEY,
      JSON.stringify({
        progressInterval: progressInterval.value,
        svgInterval: svgInterval.value,
        topN: topN.value,
        allTimeTop: allTimeTop.value,
      }),
    )
  })

  const isConfigDefault = computed(() =>
    (Object.keys(defaultConfig) as (keyof Config)[]).every(
      (k) => config.value[k] === defaultConfig[k],
    ),
  )

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
  })
  const svg = ref('')
  const top = ref<TopEntry[]>([])
  const currentGenTop = ref<TopEntry[]>([])
  const resultRnbo = ref<RNBO | null>(null)
  const error = ref<string | null>(null)

  // Original (pre-optimization) layout
  const originalSvg = ref('')
  const originalFitness = ref<Fitness | null>(null)
  const originalPositions = ref<{ id: string; x: number; y: number }[]>([])

  // Selected entry
  const selection = ref<Selection>({ kind: 'live' })

  let worker: Worker | null = null

  const canStart = computed(
    () => rnbo.value !== null && status.value !== 'running' && status.value !== 'paused',
  )
  const totalEvals = computed(
    () =>
      (config.value.generations ?? defaultConfig.generations) *
      (config.value.popSize ?? defaultConfig.popSize),
  )
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

  function resolveEntry(sel: Selection): TopEntry | null {
    if (sel.kind === 'best') return top.value[0] ?? null
    if (sel.kind === 'allTime') return top.value[sel.index] ?? null
    if (sel.kind === 'current') return currentGenTop.value[sel.index] ?? null
    return null
  }

  const displayedSvg = computed(() => {
    const sel = selection.value
    if (sel.kind === 'live') return svg.value
    if (sel.kind === 'original') return originalSvg.value
    return resolveEntry(sel)?.svg ?? ''
  })

  const displayedFitness = computed<Fitness | null>(() => {
    const sel = selection.value
    if (sel.kind === 'live') return progress.value.bestFitness
    if (sel.kind === 'original') return originalFitness.value
    return resolveEntry(sel)?.fitness ?? null
  })

  const canExport = computed(
    () => selection.value.kind === 'original' || top.value.length > 0 || resultRnbo.value !== null,
  )

  function loadFile(content: string, name: string, source: 'file' | 'clipboard' = 'file') {
    const wasRunning = status.value === 'running' || status.value === 'paused'
    if (wasRunning) stopOptimization()
    try {
      rnbo.value = JSON.parse(content) as RNBO
      fileName.value = name
      inputSource.value = source
      svg.value = ''
      top.value = []
      currentGenTop.value = []
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
      }
      selection.value = { kind: 'best' }
      originalSvg.value = ''
      originalFitness.value = null
      originalPositions.value = []
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
    top.value = []
    currentGenTop.value = []
    resultRnbo.value = null
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
    }
    selection.value = { kind: 'best' }
    originalSvg.value = ''
    originalFitness.value = null
    originalPositions.value = []

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
          }
          break
        case 'svg':
          svg.value = msg.svg
          if (msg.top?.length) top.value = msg.top
          if (msg.currentGenTop?.length) currentGenTop.value = msg.currentGenTop
          break
        case 'done':
          status.value = 'done'
          if (msg.svg) svg.value = msg.svg
          if (msg.top?.length) top.value = msg.top
          if (msg.currentGenTop?.length) currentGenTop.value = msg.currentGenTop
          resultRnbo.value = msg.rnbo ?? null
          worker?.terminate()
          worker = null
          break
        case 'error':
          status.value = 'error'
          error.value = msg.message
          worker?.terminate()
          worker = null
          break
      }
    }

    worker.onerror = (e) => {
      status.value = 'error'
      error.value = e.message
      worker?.terminate()
      worker = null
    }

    worker.postMessage({
      rnbo: toRaw(rnbo.value),
      cfg: toRaw(config.value),
      progressInterval: progressInterval.value,
      svgInterval: svgInterval.value,
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
    const map = new Map(positions.map((p) => [p.id, p]))
    for (const b of clone.patcher.boxes) {
      const pos = map.get(b.box.id)
      if (pos) {
        b.box.patching_rect[0] = Math.round(pos.x)
        b.box.patching_rect[1] = Math.round(pos.y)
      }
    }
    if (config.value.removeLineSegments) {
      for (const line of clone.patcher.lines) {
        delete line.patchline.midpoints
      }
    }
    return clone
  }

  function getExportRnbo(): RNBO | null {
    const sel = selection.value
    if (sel.kind === 'live') {
      if (resultRnbo.value) return resultRnbo.value
      const entry = top.value[0]
      if (!entry) return null
      return applyPositions(entry.positions)
    }
    if (sel.kind === 'original') return toRaw(rnbo.value)
    const entry = resolveEntry(sel)
    if (!entry) return null
    return applyPositions(entry.positions)
  }

  function getExportClipboard() {
    const rnbo = getExportRnbo()

    return {
      appVersion: rnbo?.patcher.appVersion,
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
    svgInterval,
    topN,
    allTimeTop,
    isConfigDefault,
    status,
    progress,
    svg,
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
  }
})
