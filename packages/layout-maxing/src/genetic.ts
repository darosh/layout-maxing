import { type Config } from './config.ts'
import { type Box, type Line, type LayoutEntity, fixOverlaps, normalizeLayouts, toEntities } from './layout.ts'
import { type Fitness, fitness } from './fitness.ts'
import {
  cloneLayouts,
  crossover,
  crossoverStructural,
  mutateSingle,
  mutateWithChildren,
  mutateWithParents,
  mutateByQuadrant,
  mutateSwapSibling,
  mutateSwapRandom,
  mutateSwapInRow,
  mutateSwapInCol,
  mutateShiftRow,
  mutateShiftCol,
} from './mutation.ts'
import { buildBoxEntityIndex } from './layout.ts'
import { getViewPort } from './geometry.ts'
import {
  type GenerationSnapshot,
  type RunMonitor,
  createMutationStat,
  createRunMonitor,
  computePopulationDiversity,
  buildGenerationSnapshot,
  accumulateMutStats,
  computeDeadWeightMutations,
  summarizeRun,
} from './monitor.ts'
import { applyFitnessSharing } from './niching.ts'
import { MUTATION_NAMES } from './meta.ts'

export type { GenerationSnapshot, RunMonitor }

function roulette(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return Math.floor(rand() * weights.length)
  let r = rand() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

function singleWeight(weights: number[]): number {
  const num = weights.filter((w) => w > 0).length

  if (num > 1) {
    return -1
  }

  return weights.findIndex(Boolean)
}

export interface Population {
  id: number
  gen: number
  layouts: Box[]
  fitness?: Fitness
  prevId?: number
  prevGen?: number
  origins?: string[] // layout algorithm(s) that seeded this individual
  // monitoring fields — do not affect algorithm behavior
  _mutation?: string
  _mutatedBoxId?: string
  _parentScore?: number
  lastMutation?: string // persisted after selection, used for deadWeight computation
}

function uniqueIndexes(count: number, min: number, max: number, rand: () => number, exclude?: number[]): number[] {
  const result: number[] = []
  const excluded = new Set(exclude)
  const inRangeExcludeCount = exclude ? exclude.filter((e) => e >= min && e < max).length : 0
  const sanitizeCount = Math.min(count, max - min - inRangeExcludeCount)
  while (result.length < sanitizeCount) {
    const idx = min + Math.floor(rand() * (max - min))
    if (!excluded.has(idx)) {
      excluded.add(idx)
      result.push(idx)
    }
  }
  return result
}

const ELITE_OBJECTIVES: (keyof Fitness)[] = ['collisions', 'crossings', 'overlaps', 'length', 'score', 'view']

function dominates(a: Fitness, b: Fitness): boolean {
  let strictlyBetter = false
  for (const obj of ELITE_OBJECTIVES) {
    const av = a[obj] as number
    const bv = b[obj] as number
    if (av > bv) return false
    if (av < bv) strictlyBetter = true
  }
  return strictlyBetter
}

function paretoFront(population: Population[]): Population[] {
  return population.filter((a) => !population.some((b) => b !== a && dominates(b.fitness!, a.fitness!)))
}

function applyBandit(weights: number[], runTotals: Record<string, ReturnType<typeof createMutationStat>>, exploration: number): number[] {
  const totalAttempts = Object.values(runTotals).reduce((s, v) => s + v.attempts, 0)
  if (totalAttempts === 0) return weights

  return weights.map((w, i) => {
    const name = MUTATION_NAMES[i]
    const stat = runTotals[name]
    if (!stat || stat.attempts === 0) return w
    const rate = stat.improvements / stat.attempts
    const ucb = rate + exploration * Math.sqrt(Math.log(totalAttempts + 1) / stat.attempts)
    return Math.max(0.1, ucb * 100)
  })
}

function computeNsgaRanks(population: Population[]): number[] {
  const { length } = population
  const ranks = Array.from({ length }, () => 0)
  const dominatedBy = Array.from({ length }, () => 0)
  const dominatesList: number[][] = Array.from({ length }, () => [])

  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      if (dominates(population[i].fitness!, population[j].fitness!)) {
        dominatesList[i].push(j)
        dominatedBy[j]++
      } else if (dominates(population[j].fitness!, population[i].fitness!)) {
        dominatesList[j].push(i)
        dominatedBy[i]++
      }
    }
  }

  let front = dominatedBy.reduce<number[]>((acc, d, i) => (d === 0 ? [...acc, i] : acc), [])
  let rank = 0
  while (front.length > 0) {
    const nextFront: number[] = []
    for (const i of front) {
      ranks[i] = rank
      for (const j of dominatesList[i]) {
        if (--dominatedBy[j] === 0) nextFront.push(j)
      }
    }
    rank++
    front = nextFront
  }
  return ranks
}

function precomputeCrowdingDistances(population: Population[], prop: keyof Fitness): number[] {
  const { length } = population
  const distances = Array.from({ length }, () => 0)
  const sorted = population.map((ind, i) => ({ i, v: ind.fitness![prop] as number })).sort((a, b) => a.v - b.v)
  for (let pos = 0; pos < sorted.length; pos++) {
    const { i, v } = sorted[pos]
    const prev = sorted[pos - 1]?.v ?? v
    const next = sorted[pos + 1]?.v ?? v
    distances[i] = Math.abs(v - prev) + Math.abs(next - v)
  }
  return distances
}

function tournamentSelect(
  population: Population[],
  prop: keyof Fitness,
  rand: () => number,
  cfg: Required<Config>,
  exclude?: number[],
  crowdingDistances?: number[],
  nsgaRanks?: number[],
): number {
  const getVal = (ind: Population): number => {
    if (prop === 'score' && cfg.nichingEnabled && ind.fitness!.sharedFitness !== undefined) {
      return ind.fitness!.sharedFitness
    }
    return ind.fitness![prop] as number
  }

  const [initial, ...rest] = uniqueIndexes(Math.round(cfg.tournamentSize * population.length), 0, population.length, rand, exclude)
  let bestIdx = initial

  for (const candidate of rest) {
    if (nsgaRanks) {
      const rankBest = nsgaRanks[bestIdx]
      const rankCandidate = nsgaRanks[candidate]
      if (rankCandidate < rankBest) {
        bestIdx = candidate
      } else if (rankCandidate === rankBest) {
        const distBest = crowdingDistances ? crowdingDistances[bestIdx] : 0
        const distCandidate = crowdingDistances ? crowdingDistances[candidate] : 0
        if (distCandidate > distBest) bestIdx = candidate
      }
    } else {
      const bestVal = getVal(population[bestIdx])
      const candidateVal = getVal(population[candidate])
      if (candidateVal < bestVal) {
        bestIdx = candidate
      } else if (cfg.crowdingTieBreak && candidateVal === bestVal) {
        const distBest = crowdingDistances ? crowdingDistances[bestIdx] : 0
        const distCandidate = crowdingDistances ? crowdingDistances[candidate] : 0
        if (distCandidate > distBest) bestIdx = candidate
      }
    }
  }

  return bestIdx
}

export async function createPopulation(
  startingLayouts: Box[][],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  getFitness?: (layouts: Box[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
) {
  const individuals: Population[] = []

  for (let i = 0; i < cfg.popSize; i++) {
    const base = startingLayouts[i % startingLayouts.length]
    let ind = cloneLayouts(base)

    if (i >= startingLayouts.length && cfg.initialMutation) {
      // Scale mutation count with clone round: later copies of the same starting layout get more mutations
      const cloneRound = Math.floor(i / startingLayouts.length)
      const numMutations = Math.min(cloneRound, cfg.initMutations)
      for (let m = 0; m < numMutations; m++) {
        mutateChild(ind, rand, cfg, cfg.mutate)
      }
    }

    if (cfg.repairOffspring) ind = fixOverlaps(ind, cfg)

    if (cfg.normalize) normalizeLayouts(ind)

    const originName: string | undefined = (startingLayouts[i % startingLayouts.length] as any)._layoutName
    individuals.push({ id: i, gen: 0, layouts: ind, origins: originName ? [originName] : undefined })
  }

  if (getFitness) {
    const fitnessPromises = individuals.map((ind) => {
      ;(ind.layouts as any)._popId = ind.id
      ;(ind.layouts as any)._popGen = ind.gen
      ;(ind.layouts as any)._popOrigins = ind.origins
      return getFitness(ind.layouts, lines, cfg).then((value) => {
        ind.fitness = value
        return value
      })
    })
    await Promise.all(fitnessPromises)
  } else {
    for (const ind of individuals) {
      ;(ind.layouts as any)._popId = ind.id
      ;(ind.layouts as any)._popGen = ind.gen
      ;(ind.layouts as any)._popOrigins = ind.origins
      ind.fitness = fitness(ind.layouts, lines, cfg)
    }
  }

  return individuals
}

let spare: number | null = null

function randGaussian(mean = 0, stdDev = 1, rand = Math.random) {
  if (spare !== null) {
    const val = spare
    spare = null
    return val * stdDev + mean
  }

  let u, v, s
  do {
    u = rand() * 2 - 1
    v = rand() * 2 - 1
    s = u * u + v * v
  } while (s === 0 || s >= 1)

  const mul = Math.sqrt((-2.0 * Math.log(s)) / s)
  spare = v * mul

  return mean + stdDev * u * mul
}

function randGausInt(min: number, max: number, rand: () => number) {
  // Map abs(Gaussian) to [0,1): values near 0 are most likely, so min is favored
  const raw = Math.abs(randGaussian(0, 1, rand))
  const clamped = Math.min(raw / 3, 0.9999) // 3-sigma covers ~99.7%, map to [0,1)
  const sign = rand() < 0.5 ? -1 : 1
  // Inline floor instead of passing constant as rand to randInt
  return sign * (Math.floor(clamped * (max - min + 1)) + min)
}

function applyOneMutation(
  target: LayoutEntity,
  entities: LayoutEntity[],
  boxEntityMap: Map<number, LayoutEntity>,
  mutIdx: number,
  x: number,
  y: number,
  rand: () => number,
  cfg: Required<Config>,
) {
  if (mutIdx === 0) {
    mutateByQuadrant(target, entities, { x, y }, Math.floor(rand() * 4))
  } else if (mutIdx === 1) {
    mutateSingle(target, { x, y })
  } else if (mutIdx === 2) {
    mutateWithChildren(target, entities, { x, y }, cfg.maxChildren, boxEntityMap)
  } else if (mutIdx === 3) {
    mutateWithParents(target, entities, { x, y }, cfg.maxParents, boxEntityMap)
  } else if (mutIdx === 4) {
    mutateSwapSibling(target, entities, rand, boxEntityMap)
  } else if (mutIdx === 5) {
    mutateSwapRandom(target, entities, rand)
  } else if (mutIdx === 6) {
    mutateSwapInRow(target, entities, rand, cfg)
  } else if (mutIdx === 7) {
    mutateSwapInCol(target, entities, rand, cfg)
  } else if (mutIdx === 8) {
    mutateShiftRow(target, entities, { x })
  } else {
    mutateShiftCol(target, entities, { y })
  }
}

function mutateChild(
  child: Box[],
  rand: () => number,
  cfg: Required<Config>,
  effectiveMutate: number,
  mutWeights?: number[],
  multiMutRate?: number,
  entities?: LayoutEntity[],
  boxEntityMap?: Map<number, LayoutEntity>,
) {
  entities ??= toEntities(child)
  boxEntityMap ??= buildBoxEntityIndex(entities)
  const targetEntity: LayoutEntity = entities[Math.floor(rand() * entities.length)]
  const mutatedBox = targetEntity.members[0].box

  const weights = mutWeights ?? [
    cfg.mutWeightQuadrant,
    cfg.mutWeightSingle,
    cfg.mutWeightChildren,
    cfg.mutWeightParents,
    cfg.mutWeightSwapSibling,
    cfg.mutWeightSwapRandom,
    cfg.mutWeightSwapInRow,
    cfg.mutWeightSwapInCol,
    cfg.mutWeightShiftRow,
    cfg.mutWeightShiftCol,
  ]
  const mutIdx = roulette(weights, rand)

  const childMutation = MUTATION_NAMES[mutIdx]
  const mxy = rand()
  const [_x, _y, w, h] = getViewPort(child)
  const mutateX = w * effectiveMutate
  const mutateY = h * effectiveMutate
  const maxX = Math.max(Math.round((0.5 * mutateX) / cfg.gridX), 1)
  const maxY = Math.max(Math.round((0.5 * mutateY) / cfg.gridY), 1)

  const half = cfg.mutateXYOverlap / 2
  const x = mxy < 0.5 + half || mutIdx === 8 ? randGausInt(1, maxX, rand) * cfg.gridX : 0
  const y = mxy >= 0.5 - half || mutIdx === 9 ? randGausInt(1, maxY, rand) * cfg.gridY : 0

  applyOneMutation(targetEntity, entities, boxEntityMap, mutIdx, x, y, rand, cfg)

  // Multi-point mutation: additional per-entity Bernoulli passes under stagnation
  if (multiMutRate && multiMutRate > 0) {
    const [_x2, _y2, w2, h2] = getViewPort(child)
    const mx2 = w2 * effectiveMutate
    const my2 = h2 * effectiveMutate
    const maxX2 = Math.round((0.5 * mx2) / cfg.gridX)
    const maxY2 = Math.round((0.5 * my2) / cfg.gridY)
    for (const e of entities) {
      if (e === targetEntity) continue
      if (rand() < multiMutRate) {
        const mi = roulette(weights, rand)
        const mxy2 = rand()
        const half2 = cfg.mutateXYOverlap / 2
        const ex = mxy2 < 0.5 + half2 || mi === 8 ? randGausInt(1, maxX2, rand) * cfg.gridX : 0
        const ey = mxy2 >= 0.5 - half2 || mi === 9 ? randGausInt(1, maxY2, rand) * cfg.gridY : 0
        applyOneMutation(e, entities, boxEntityMap, mi, ex, ey, rand, cfg)
      }
    }
  }

  return { child, mutatedBox, childMutation }
}

async function runGenetic(
  startingLayouts: Box[][],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  getFitness?: (layouts: Box[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
  onIntermediate?: (layouts: Box[]) => void,
  onGenerationEnd?: (stop: number, snapshot?: GenerationSnapshot) => void,
  logProgress?: (...args: any) => void,
  logInfo?: (...args: any) => void,
  onMonitorEnd?: (monitor: RunMonitor) => void,
): Promise<Box[]> {
  spare = null
  // Create population
  let population = await createPopulation(startingLayouts, lines, rand, cfg, getFitness)

  // If all boxes were stripped (e.g. ignoreOrphans + no lines), return empty
  if (population[0].layouts.length === 0) {
    if (logInfo) {
      logInfo('No boxes!')
    }

    return []
  }

  const initialFitness = getFitness ? await getFitness(population[0].layouts, lines, cfg) : fitness(population[0].layouts, lines, cfg)
  if (logInfo) logInfo(`Initial fitness ${initialFitness.score.toFixed(0)}\n${JSON.stringify(initialFitness, null, 2)}`)

  const bestInitIdx = population.reduce((bi, ind, i) => (ind.fitness!.score < population[bi].fitness!.score ? i : bi), 0)
  let bestFitnessScore = population[bestInitIdx].fitness!.score
  let bestFitness: Fitness | undefined = population[bestInitIdx].fitness
  let bestIndividual: Box[] = cloneLayouts(population[bestInitIdx].layouts)

  if (logInfo) logInfo('Starting genetic layout optimization...')
  let stop = cfg.stop
  let lastProgressLog = 0
  const monitor = createRunMonitor()
  let stagnation = 0
  let nextPopId = cfg.popSize
  let effectiveMutWeights = [
    cfg.mutWeightQuadrant,
    cfg.mutWeightSingle,
    cfg.mutWeightChildren,
    cfg.mutWeightParents,
    cfg.mutWeightSwapSibling,
    cfg.mutWeightSwapRandom,
    cfg.mutWeightSwapInRow,
    cfg.mutWeightSwapInCol,
    cfg.mutWeightShiftRow,
    cfg.mutWeightShiftCol,
  ]

  for (let gen = 0; gen < cfg.generations; gen++) {
    let fitnessValues: Fitness[]
    if (getFitness) {
      fitnessValues = await Promise.all(
        population.map(async (ind) => {
          if (ind.fitness === undefined) {
            ;(ind.layouts as any)._popId = ind.id
            ;(ind.layouts as any)._popGen = ind.gen
            ;(ind.layouts as any)._popPrevId = ind.prevId
            ;(ind.layouts as any)._popPrevGen = ind.prevGen
            ;(ind.layouts as any)._popOrigins = ind.origins
            ind.fitness = await getFitness(ind.layouts, lines, cfg)
          }
          return ind.fitness
        }),
      )
    } else {
      for (const ind of population) {
        if (ind.fitness === undefined) {
          ;(ind.layouts as any)._popId = ind.id
          ;(ind.layouts as any)._popGen = ind.gen
          ;(ind.layouts as any)._popPrevId = ind.prevId
          ;(ind.layouts as any)._popPrevGen = ind.prevGen
          ;(ind.layouts as any)._popOrigins = ind.origins
          ind.fitness = fitness(ind.layouts, lines, cfg)
        }
      }
      fitnessValues = population.map((ind) => ind.fitness!)
    }

    if (cfg.nichingEnabled) {
      applyFitnessSharing(population, cfg.nichingRadius, cfg.nichingExponent)
    }

    // Track global best
    let minScore = Infinity
    let currentBestIdx = 0
    for (let i = 0; i < fitnessValues.length; i++) {
      if (fitnessValues[i].score < minScore) {
        minScore = fitnessValues[i].score
        currentBestIdx = i
      }
    }

    // --- monitoring: per-mutation improvement stats ---
    const genMutStats: Record<string, ReturnType<typeof createMutationStat>> = {}
    for (const ind of population) {
      const mut = ind._mutation
      if (!mut) continue
      if (!genMutStats[mut]) genMutStats[mut] = createMutationStat()
      const delta = ind._parentScore !== undefined ? ind.fitness!.score - ind._parentScore : 0
      genMutStats[mut].attempts++
      genMutStats[mut].totalDelta += delta
      if (delta < 0) genMutStats[mut].improvements++
    }

    if (fitnessValues[currentBestIdx].score < bestFitnessScore) {
      const prevBest = bestFitnessScore
      bestFitness = fitnessValues[currentBestIdx]
      bestFitnessScore = bestFitness.score
      bestIndividual = cloneLayouts(population[currentBestIdx].layouts)
      const newBest = population[currentBestIdx]
      ;(bestIndividual as any)._popId = newBest.id
      ;(bestIndividual as any)._popGen = newBest.gen
      ;(bestIndividual as any)._popPrevId = newBest.prevId
      ;(bestIndividual as any)._popPrevGen = newBest.prevGen
      ;(bestIndividual as any)._popOrigins = newBest.origins
      stop = cfg.stop
      stagnation = 0
      // record lineage event
      monitor.bestLineage.push({
        gen,
        mutation: newBest._mutation ?? 'unknown',
        boxId: newBest._mutatedBoxId ?? '',
        delta: bestFitnessScore - prevBest,
      })
    } else {
      stop--
      stagnation++
      if (stop === cfg.svgAtStop && onIntermediate) {
        onIntermediate(bestIndividual)
      }
    }

    if (logProgress) {
      const now = Date.now()
      if (now - lastProgressLog >= cfg.logProgressInterval || gen === cfg.generations - 1) {
        lastProgressLog = now
        logProgress(
          `GEN: ${gen + 1} | SCO: ${bestFitnessScore.toFixed(0)} | COL/OVE/CRO/ARE ${bestFitness?.collisions}/${bestFitness?.overlaps}/${bestFitness?.crossings}/${bestFitness?.area.toFixed(
            0,
          )} | STO: ${stop}`,
        )
      }
    }

    // --- diversity-aware effective mutation rate ---
    const diversity = computePopulationDiversity(population)
    let effectiveMutationRate = cfg.mutationRate
    let effectiveMutate = cfg.mutate

    if (cfg.diversityBoost > 0) {
      const boost = 1 + cfg.diversityBoost * (1 - diversity)
      effectiveMutate = cfg.mutate * Math.min(cfg.diversityBoostCap, boost)
    }
    if (cfg.diversityBoostFactor > 0) {
      effectiveMutationRate = Math.min(1, effectiveMutationRate + (1 - diversity) * cfg.diversityBoostFactor)
    }

    const inStagnation = cfg.stagnationThreshold > 0 && stagnation >= cfg.stagnationThreshold
    if (inStagnation) {
      effectiveMutationRate = Math.min(1, effectiveMutationRate * cfg.stagnationRate)
      effectiveMutate = effectiveMutate * cfg.stagnationRate
    }
    const effectiveMultiMutRate = inStagnation ? cfg.multiMutRate * 2 : cfg.multiMutRate

    // --- monitoring: build and store snapshot ---
    const snapshot = buildGenerationSnapshot(
      gen,
      fitnessValues.map((f) => f.score),
      diversity,
      stagnation,
      genMutStats,
      effectiveMutationRate,
      effectiveMutate,
      population,
    )
    monitor.snapshots.push(snapshot)
    accumulateMutStats(monitor.runTotals, genMutStats)

    if (cfg.banditEnabled && (gen + 1) % cfg.banditK === 0) {
      effectiveMutWeights = applyBandit(effectiveMutWeights, monitor.runTotals, cfg.banditExploration)
    }

    onGenerationEnd?.(stop, snapshot)

    if (!stop) {
      break
    }

    // Build next generation
    const globalBest: Population = {
      ...population[currentBestIdx],
      layouts: bestIndividual, // safe: offspring always clone before mutating
      fitness: bestFitness,
    }
    const newPopulation: Population[] = [globalBest]

    // monitoring helper: track elite survival
    const trackEliteSurvival = (ind: Population) => {
      if (ind._mutation && monitor.runTotals[ind._mutation]) {
        monitor.runTotals[ind._mutation].survived++
      }
    }
    trackEliteSurvival(globalBest)

    // Pareto front elitism: fill up to eliteSize with unique non-dominated individuals
    const front = paretoFront(population)
    const eliteAdded = new Set<number>([currentBestIdx])
    for (const ind of front) {
      if (newPopulation.length >= cfg.eliteSize) break
      const idx = population.indexOf(ind)
      if (!eliteAdded.has(idx)) {
        eliteAdded.add(idx)
        newPopulation.push(ind)
        trackEliteSurvival(ind)
      }
    }

    // const props = <(keyof Fitness)[]>['score', 'view', 'crossings']
    const props = <(keyof Fitness)[]>['score', 'view']
    // const props = <(keyof Fitness)[]>['score']

    const nsgaRanks = cfg.nsgaEnabled ? computeNsgaRanks(population) : undefined
    // For NSGA-II crowding, use 'score' distances; for standard mode, alternate props
    const crowdingCache = cfg.crowdingTieBreak ? new Map(props.map((p) => [p, precomputeCrowdingDistances(population, p)])) : undefined
    const nsgaCrowding = nsgaRanks ? precomputeCrowdingDistances(population, 'score') : undefined

    while (newPopulation.length < cfg.popSize) {
      const prop1 = props[newPopulation.length % props.length]
      const i1 = tournamentSelect(population, prop1, rand, cfg, undefined, nsgaRanks ? nsgaCrowding : crowdingCache?.get(prop1), nsgaRanks)
      const p1 = population[i1]

      let child: Box[]
      let childMutation: string = 'none'
      let mutatedBox: Box | undefined
      let childOrigins: string[] | undefined
      if (rand() < cfg.crossoverRate) {
        const prop2 = props[(newPopulation.length + 1) % props.length]
        const i2 = tournamentSelect(population, prop2, rand, cfg, [i1], nsgaRanks ? nsgaCrowding : crowdingCache?.get(prop2), nsgaRanks)
        const p2 = population[i2]

        const crossWeights = [cfg.crossWeightRandom, cfg.crossWeightStruct]
        const sw = singleWeight(crossWeights)
        const crossoverIdx = sw !== -1 ? sw : roulette(crossWeights, rand)

        if (crossoverIdx === 0) {
          child = crossover(p1.layouts, p2.layouts, rand, cfg)
          childMutation = 'crossover'
        } else {
          child = crossoverStructural(p1.layouts, p2.layouts, rand)
          childMutation = 'crossoverStructural'
        }
        if (rand() < effectiveMutationRate) {
          const childEntities = toEntities(child)
          const childBoxEntityMap = buildBoxEntityIndex(childEntities)
          const __ret = mutateChild(child, rand, cfg, effectiveMutate, effectiveMutWeights, effectiveMultiMutRate, childEntities, childBoxEntityMap)
          child = __ret.child
          mutatedBox = __ret.mutatedBox
          childMutation = __ret.childMutation
        }
        const merged = [...(p1.origins ?? []), ...(p2.origins ?? [])]
        childOrigins = merged.length ? [...new Set(merged)] : undefined
      } else {
        child = cloneLayouts(p1.layouts)

        if (rand() < effectiveMutationRate) {
          const childEntities = toEntities(child)
          const childBoxEntityMap = buildBoxEntityIndex(childEntities)
          const __ret = mutateChild(child, rand, cfg, effectiveMutate, effectiveMutWeights, effectiveMultiMutRate, childEntities, childBoxEntityMap)
          child = __ret.child
          mutatedBox = __ret.mutatedBox
          childMutation = __ret.childMutation
        }
        childOrigins = p1.origins
      }

      // Increment per-box mutation counts (monitoring, doesn't affect algorithm)
      if (childMutation !== 'crossover' && childMutation !== 'crossoverStructural' && childMutation !== 'none' && mutatedBox) {
        mutatedBox._mutations = {
          ...mutatedBox._mutations,
          [childMutation]: (mutatedBox._mutations?.[childMutation] ?? 0) + 1,
        }
      }

      if (cfg.repairOffspring) child = fixOverlaps(child, cfg)

      if (cfg.normalize) normalizeLayouts(child)

      newPopulation.push({
        id: nextPopId++,
        gen: gen + 1,
        prevId: p1.id,
        prevGen: p1.gen,
        origins: childOrigins,
        layouts: child,
        _mutation: childMutation,
        _mutatedBoxId: mutatedBox?.id ?? '',
        _parentScore: p1.fitness!.score,
        lastMutation: childMutation,
      })
    }

    // Catastrophe restart: reinitialise bottom fraction of non-elite slots
    if (cfg.catastropheThreshold > 0 && stagnation >= cfg.catastropheThreshold) {
      const numElite = Math.min(cfg.eliteSize, newPopulation.length)
      const numToReplace = Math.floor(cfg.catastropheFraction * (cfg.popSize - numElite))
      for (let r = 0; r < numToReplace; r++) {
        const freshLayouts = cloneLayouts(bestIndividual)
        mutateChild(freshLayouts, rand, cfg, cfg.mutate * 2, effectiveMutWeights)
        if (cfg.repairOffspring) fixOverlaps(freshLayouts, cfg)
        if (cfg.normalize) normalizeLayouts(freshLayouts)
        newPopulation[newPopulation.length - 1 - r] = {
          id: nextPopId++,
          gen: gen + 1,
          layouts: freshLayouts,
          _mutation: 'catastrophe',
          lastMutation: 'catastrophe',
        }
      }
      stagnation = 0
      // stop = Math.min(stop + Math.floor(cfg.stop * cfg.catastropheFraction), cfg.stop)
    }

    population = newPopulation
  }

  if (logInfo) logInfo(`Optimization finished. Final fitness: ${bestFitnessScore.toFixed(0)}\n${JSON.stringify(bestFitness, null, 2)}`)

  // Finalize monitor
  const sortedFinal = [...population].filter((ind) => ind.fitness !== undefined).sort((a, b) => a.fitness!.score - b.fitness!.score)
  monitor.deadWeightMutations = computeDeadWeightMutations(sortedFinal, monitor.runTotals)
  onMonitorEnd?.(monitor)
  if (logInfo) logInfo(summarizeRun(monitor))

  return bestIndividual
}

export default runGenetic
