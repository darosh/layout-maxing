import {
  type BoxLayout,
  type Config,
  type Line,
  type Fitness,
  defaultConfig,
  configMeta,
} from 'layout-maxing'

// Uses configMeta min/max by default — override with [min, max] only when the meta range
// includes trivially-good values (e.g. exponential bases that go to 1.0).
const calibrateDefault: Partial<Record<keyof Config, true | [number, number]>> = {
  crossPenalty: true,
  overPenalty: true,
  totalCollisionPenalty: [1.01, 2],
  totalSSCPenalty: [1.01, 2],
  misalignedSSPenalty: [1.01, 2],
  totalCrossPenalty: [1.01, 2],
  totalOverPenalty: [1.01, 2],
  reversePenalty: true,
}

interface ParamResult {
  key: keyof Config
  defaultVal: number
  bestVal: number
  bestScore: number
  improvementPct: number
}

interface CalibrateResult {
  paramResults: ParamResult[]
  combinedBestConfig: Partial<Config>
  combinedBestScore: number
  defaultScore: number
  closestToDefault: {
    config: Partial<Config>
    score: number
    similarity: number
  }
}

export function getNumericParams(
  whitelist: Partial<Record<keyof Config, true | [number, number]>> = calibrateDefault,
) {
  return Object.entries(configMeta)
    .filter(([key, entry]) => entry[3] !== null && key in whitelist)
    .map(([key, entry]) => {
      const override = whitelist[key as keyof Config]
      const metaMin = entry[1] as number
      const metaMax = entry[2] as number
      const [min, max] = Array.isArray(override) ? override : [metaMin, metaMax]
      return {
        key: key as keyof Config,
        default: entry[0] as number,
        min,
        max,
      }
    })
    .filter(({ min, max }) => min !== max)
}

function sampleValues(min: number, max: number, depth: number): number[] {
  if (depth === 1) return [(min + max) / 2]
  return Array.from({ length: depth }, (_, i) => min + (i / (depth - 1)) * (max - min))
}

// Returns 1.0 when cfg matches defaultConfig exactly, 0.0 when maximally different.
// Uses normalized L2 distance so zero-vector configs are handled correctly.
function similarityToDefault(
  cfg: Partial<Config>,
  params: ReturnType<typeof getNumericParams>,
): number {
  let sumSq = 0
  for (const { key, min, max } of params) {
    const range = max - min
    const val = (cfg[key] as number) ?? (defaultConfig[key] as number)
    const def = defaultConfig[key] as number
    sumSq += ((val - def) / range) ** 2
  }
  // Normalize: max possible distance is sqrt(params.length) (all params at opposite extreme)
  const maxDist = Math.sqrt(params.length)
  return 1 - Math.sqrt(sumSq) / maxDist
}

export async function runCalibrate(
  layouts: BoxLayout[],
  lines: Line[],
  depth: number,
  getFitness: (...input: unknown[]) => Promise<Fitness>,
): Promise<CalibrateResult> {
  const params = getNumericParams()

  // Baseline
  const baselineFitness = await getFitness(layouts, lines, defaultConfig)
  const defaultScore = baselineFitness.score

  // Enqueue all univariate jobs upfront
  const allJobs: Promise<Fitness>[] = []
  for (const param of params) {
    for (const value of sampleValues(param.min, param.max, depth)) {
      allJobs.push(getFitness(layouts, lines, { ...defaultConfig, [param.key]: value }))
    }
  }
  const allResults = await Promise.all(allJobs)

  // Collate per-param results
  const paramResults: ParamResult[] = []
  let jobIdx = 0
  for (const param of params) {
    const values = sampleValues(param.min, param.max, depth)
    let bestVal = param.default
    let bestScore = defaultScore
    for (const value of values) {
      const score = allResults[jobIdx++].score
      if (score < bestScore) {
        bestScore = score
        bestVal = value
      }
    }
    paramResults.push({
      key: param.key,
      defaultVal: param.default,
      bestVal,
      bestScore,
      improvementPct: ((defaultScore - bestScore) / defaultScore) * 100,
    })
  }

  // Combined best config
  const combinedBestConfig: Partial<Config> = Object.fromEntries(
    paramResults.map((r) => [r.key, r.bestVal]),
  )
  const combinedFitness = await getFitness(layouts, lines, {
    ...defaultConfig,
    ...combinedBestConfig,
  })
  const combinedBestScore = combinedFitness.score

  // For each param, find the value with best score while keeping similarity to default high.
  // Candidates: each per-param best + the combined config.
  const candidates = [
    { config: combinedBestConfig, score: combinedBestScore },
    ...paramResults.map((r) => ({
      config: { [r.key]: r.bestVal } as Partial<Config>,
      score: r.bestScore,
    })),
  ]
  const withSimilarity = candidates.map((c) => ({
    ...c,
    similarity: similarityToDefault(c.config, params),
  }))
  const threshold = 0.9
  const aboveThreshold = withSimilarity.filter((c) => c.similarity >= threshold)
  const closestToDefault =
    aboveThreshold.length > 0
      ? aboveThreshold.reduce((a, b) => (a.score < b.score ? a : b))
      : withSimilarity.reduce((a, b) =>
          Math.abs(a.similarity - threshold) < Math.abs(b.similarity - threshold) ? a : b,
        )

  return { paramResults, combinedBestConfig, combinedBestScore, defaultScore, closestToDefault }
}

export function printCalibrateResults(result: CalibrateResult): void {
  const { paramResults, combinedBestScore, defaultScore, closestToDefault } = result

  function fmt(n: number): string {
    if (n === 0) return '0'
    const abs = Math.abs(n)
    if (abs >= 1e6 || (abs < 0.01 && abs > 0)) return n.toExponential(2)
    if (Number.isInteger(n)) return String(n)
    return n.toFixed(3)
  }

  const combinedImprove = ((defaultScore - combinedBestScore) / defaultScore) * 100

  console.log(`\nBaseline score (defaults): ${fmt(defaultScore)}`)

  // Primary: constrained best (high similarity to default — penalties stay meaningful)
  const closestImprove = ((defaultScore - closestToDefault.score) / defaultScore) * 100
  console.log(
    `\n--- Recommended config (similarity: ${closestToDefault.similarity.toFixed(3)}) ---`,
  )
  console.log(
    `Score: ${fmt(closestToDefault.score)}  (${closestImprove >= 0 ? '-' : '+'}${Math.abs(closestImprove).toFixed(1)}% vs baseline)`,
  )
  const closestDiff = Object.fromEntries(
    Object.entries(closestToDefault.config).filter(
      ([k, v]) => (defaultConfig as Record<string, unknown>)[k] !== v,
    ),
  )
  console.log(JSON.stringify(closestDiff, null, 2))

  // Table: per-param sensitivity
  console.log(
    '\n' +
      'Parameter'.padEnd(28) +
      'Default'.padStart(10) +
      'Best'.padStart(10) +
      'Score'.padStart(12) +
      'Improve%'.padStart(10),
  )
  console.log('-'.repeat(70))

  const sorted = [...paramResults].sort((a, b) => b.improvementPct - a.improvementPct)
  for (const r of sorted) {
    const marker = r.bestVal !== r.defaultVal ? '*' : ' '
    console.log(
      `${marker}${String(r.key).padEnd(27)}` +
        fmt(r.defaultVal).padStart(10) +
        fmt(r.bestVal).padStart(10) +
        fmt(r.bestScore).padStart(12) +
        `${r.improvementPct.toFixed(1)}%`.padStart(10),
    )
  }

  // Secondary: unconstrained best (informational — may have disabled penalties)
  console.log(`\n--- Unconstrained best (combined) ---`)
  console.log(
    `Score: ${fmt(combinedBestScore)}  (${combinedImprove >= 0 ? '-' : '+'}${Math.abs(combinedImprove).toFixed(1)}% vs baseline)`,
  )
  const bestDiff = Object.fromEntries(
    paramResults.filter((r) => r.bestVal !== r.defaultVal).map((r) => [r.key, r.bestVal]),
  )
  console.log(JSON.stringify(bestDiff, null, 2))
}
