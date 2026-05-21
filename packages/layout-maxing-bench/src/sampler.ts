// Deterministic samplers that emit (config, example) work items for each phase.
//
// All samplers take a master `seed` and a `sampleSeed` (offset within the phase/group),
// so resuming = read max(sample_seed) from db and continue from there. The sampleSeed
// is also stored in the row, making each draw fully reproducible.

import { defaultConfig, PRESETS, type Config } from 'layout-maxing'

// Local mulberry32 — avoids depending on a non-exported helper from layout-maxing.
function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
import { CLUSTERED_EXAMPLES, EXAMPLES, NON_CLUSTERED_EXAMPLES, type ExampleDef } from './examples.ts'
import { GROUPS, type GroupDef, PRESET_NAMES_CLUSTERED, PRESET_NAMES_NON_CLUSTERED } from './groups.ts'

export const STOP_CAP = 1499

// Standard config tail applied to every swept row (presets are exempt).
// `passes=1` is a hard project constraint (one GA pass per row).
// `popSize` defaults to 20 (matches defaultConfig) and is overridden by groups
// that explicitly sweep it.
export function sweptBase(): Partial<Config> {
  return {
    popSize: 20,
    stop: STOP_CAP,
    passes: 1,
    deterministic: true,
  }
}

export interface WorkItem {
  group: GroupDef['name'] | 'baseline' | 'preset' | 'oat' | 'gapfill'
  example: ExampleDef
  preset: string | null
  sampleSeed: number
  cfg: Config // partial — caller merges with defaultConfig
  paramValues: Record<string, number> // params we want indexed for analysis
  gaSeed: number
}

// ---- Halton low-discrepancy sequence (for gap-fill) ----
function halton(index: number, base: number): number {
  let f = 1
  let r = 0
  let i = index + 1
  while (i > 0) {
    f /= base
    r += f * (i % base)
    i = Math.floor(i / base)
  }
  return r
}
const HALTON_BASES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

function mapRange(u: number, r: { min: number; max: number; integer?: boolean }): number {
  const v = r.min + u * (r.max - r.min)
  return r.integer ? Math.round(v) : Number(v.toFixed(6))
}

function gaSeedFor(group: string, example: string, sampleSeed: number): number {
  // Distinct stable seeds per (group, example, sampleSeed) without collisions across phases.
  let h = 2166136261 >>> 0
  for (const s of [group, example, String(sampleSeed)]) {
    for (let i = 0; i < s.length; i++) h = ((h ^ s.charCodeAt(i)) * 16777619) >>> 0
  }
  return h % 0x7fffffff || 1
}

// ---- Phase: baseline ----
// Default config on ex1-4; default Clustered on ex5.
export function* genBaseline(): Generator<WorkItem> {
  for (const ex of EXAMPLES) {
    const preset = ex.clusteredOnly ? 'Clustered' : 'Default'
    const presetCfg = (PRESETS as Record<string, Partial<Config>>)[preset]
    yield {
      group: 'baseline',
      example: ex,
      preset,
      sampleSeed: 0,
      cfg: { ...presetCfg, passes: 1, deterministic: true },
      paramValues: {},
      gaSeed: gaSeedFor('baseline', ex.name, 0),
    }
  }
}

// ---- Phase: preset ----
// Every preset on every applicable example.
export function* genPresets(): Generator<WorkItem> {
  let i = 0
  for (const ex of EXAMPLES) {
    const names = ex.clusteredOnly ? PRESET_NAMES_CLUSTERED : PRESET_NAMES_NON_CLUSTERED
    for (const name of names) {
      const presetCfg = (PRESETS as Record<string, Partial<Config>>)[name] ?? {}
      yield {
        group: 'preset',
        example: ex,
        preset: name,
        sampleSeed: i++,
        cfg: { ...presetCfg, passes: 1, deterministic: true },
        paramValues: {},
        gaSeed: gaSeedFor('preset', ex.name, i),
      }
    }
  }
}

// ---- Phase: OAT (one-at-a-time) ----
// For each param in each group: low/mid/high, others at defaults.
export function* genOAT(): Generator<WorkItem> {
  const base = sweptBase()
  let counter = 0
  for (const g of GROUPS) {
    const examples = g.clusteredOnly ? CLUSTERED_EXAMPLES : NON_CLUSTERED_EXAMPLES
    for (const [pname, range] of Object.entries(g.params)) {
      for (const u of [0, 0.5, 1]) {
        const v = mapRange(u, range)
        for (const ex of examples) {
          const cfg: Config = { ...base, ...g.fixed, [pname]: v } as Config
          // cluster group needs cluster>0 even for non-cluster params (since clusteredOnly examples).
          if (g.name === 'cluster' && (cfg.cluster ?? 0) <= 0) cfg.cluster = 6
          yield {
            group: 'oat',
            example: ex,
            preset: null,
            sampleSeed: counter++,
            cfg,
            paramValues: { [pname]: v },
            gaSeed: gaSeedFor('oat', ex.name, counter),
          }
        }
      }
    }
  }
}

// ---- Phase: synergy (per-group joint sweep, Halton-ordered) ----
export function* genSynergy(groupName?: string, maxPerGroup = 200): Generator<WorkItem> {
  const base = sweptBase()
  const groups = groupName ? GROUPS.filter((g) => g.name === groupName) : GROUPS
  for (const g of groups) {
    const examples = g.clusteredOnly ? CLUSTERED_EXAMPLES : NON_CLUSTERED_EXAMPLES
    const pnames = Object.keys(g.params)
    for (let i = 0; i < maxPerGroup; i++) {
      const draw: Record<string, number> = {}
      if (g.name === 'mutweights') {
        // Dirichlet via -log(uniform), normalized to sum=100.
        const rand = mulberry32(i + 1)
        const raws = pnames.map(() => -Math.log(Math.max(1e-9, rand())))
        const sum = raws.reduce((a, b) => a + b, 0)
        pnames.forEach((p, k) => (draw[p] = Number(((raws[k] / sum) * 100).toFixed(3))))
      } else {
        pnames.forEach((p, k) => {
          const u = halton(i, HALTON_BASES[k % HALTON_BASES.length])
          draw[p] = mapRange(u, g.params[p])
        })
      }
      for (const ex of examples) {
        const cfg: Config = { ...base, ...g.fixed, ...draw } as Config
        if (g.name === 'cluster' && (cfg.cluster ?? 0) <= 0) cfg.cluster = 6
        yield {
          group: g.name,
          example: ex,
          preset: null,
          sampleSeed: i,
          cfg,
          paramValues: draw,
          gaSeed: gaSeedFor(g.name, ex.name, i),
        }
      }
    }
  }
}

// ---- Phase: gapfill ----
// Same Halton stream as synergy but starting where the db left off (caller supplies offset).
export function* genGapfill(group: GroupDef['name'], offset: number, count: number): Generator<WorkItem> {
  const base = sweptBase()
  const g = GROUPS.find((x) => x.name === group)!
  const examples = g.clusteredOnly ? CLUSTERED_EXAMPLES : NON_CLUSTERED_EXAMPLES
  const pnames = Object.keys(g.params)
  for (let i = offset; i < offset + count; i++) {
    const draw: Record<string, number> = {}
    pnames.forEach((p, k) => {
      const u = halton(i, HALTON_BASES[k % HALTON_BASES.length])
      draw[p] = mapRange(u, g.params[p])
    })
    for (const ex of examples) {
      const cfg: Config = { ...base, ...g.fixed, ...draw } as Config
      if (g.name === 'cluster' && (cfg.cluster ?? 0) <= 0) cfg.cluster = 6
      yield {
        group: 'gapfill',
        example: ex,
        preset: null,
        sampleSeed: i,
        cfg,
        paramValues: draw,
        gaSeed: gaSeedFor('gapfill:' + g.name, ex.name, i),
      }
    }
  }
}

// Resolve a WorkItem against defaultConfig to get the fully-effective Config.
export function resolveConfig(item: WorkItem): Required<Config> {
  return { ...defaultConfig, ...item.cfg, seed: item.gaSeed } as Required<Config>
}
