import { type Config } from './config.ts'
import {
  type Box,
  type Line,
  type LayoutEntity,
  fixOverlaps,
  normalizeLayouts,
  toEntities,
} from './layout.ts'
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
import { getViewPort } from './geometry.ts'
import {
  type GenerationSnapshot,
  type RunMonitor,
  MUTATION_NAMES,
  createMutationStat,
  createRunMonitor,
  computePopulationDiversity,
  buildGenerationSnapshot,
  accumulateMutStats,
  computeDeadWeightMutations,
} from './monitor.ts'
import { applyFitnessSharing } from './niching.ts'

export type { GenerationSnapshot, RunMonitor }

function roulette(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0)
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

interface Population {
  id: number
  gen: number
  layouts: Box[]
  fitness?: Fitness
  prevId?: number
  prevGen?: number
  // monitoring fields — do not affect algorithm behavior
  _mutation?: string
  _mutatedBoxId?: string
  _parentScore?: number
  lastMutation?: string // persisted after selection, used for deadWeight computation
}

function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) return undefined

  let minItem = arr[0]
  let minValue = fn(minItem)

  for (let i = 1; i < arr.length; i++) {
    const value = fn(arr[i])
    if (value < minValue) {
      minValue = value
      minItem = arr[i]
    }
  }

  return minItem
}

function uniqueIndexes(
  count: number,
  min: number,
  max: number,
  rand: () => number,
  exclude?: number[],
): number[] {
  const result: number[] = []
  const excluded = new Set(exclude)
  const sanitizeCount = Math.min(count, max - min - (exclude ? exclude.length : 0))
  while (result.length < sanitizeCount) {
    const idx = min + Math.floor(rand() * (max - min))
    if (!excluded.has(idx)) {
      excluded.add(idx)
      result.push(idx)
    }
  }
  return result
}

function crowdingDistance(population: Population[], idx: number, prop: keyof Fitness): number {
  const val = population[idx].fitness![prop] as number
  const sorted = population
    .map((ind, i) => ({ i, v: ind.fitness![prop] as number }))
    .sort((a, b) => a.v - b.v)
  const pos = sorted.findIndex((e) => e.i === idx)
  const prev = sorted[pos - 1]?.v ?? val
  const next = sorted[pos + 1]?.v ?? val
  return Math.abs(val - prev) + Math.abs(next - val)
}

function tournamentSelect(
  population: Population[],
  prop: keyof Fitness,
  rand: () => number,
  cfg: Required<Config>,
  exclude?: number[],
): number {
  const getVal = (ind: Population): number => {
    if (prop === 'score' && cfg.nichingEnabled && ind.fitness!.sharedFitness !== undefined) {
      return ind.fitness!.sharedFitness
    }
    return ind.fitness![prop] as number
  }

  const [initial, ...rest] = uniqueIndexes(
    Math.round(cfg.tournamentSize * population.length),
    0,
    population.length,
    rand,
    exclude,
  )
  let bestIdx = initial

  for (const candidate of rest) {
    const bestVal = getVal(population[bestIdx])
    const candidateVal = getVal(population[candidate])
    if (candidateVal < bestVal) {
      bestIdx = candidate
    } else if (cfg.crowdingTieBreak && candidateVal === bestVal) {
      const distBest = crowdingDistance(population, bestIdx, prop)
      const distCandidate = crowdingDistance(population, candidate, prop)
      if (distCandidate > distBest) bestIdx = candidate
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

    // this does not lead to meaningful population
    // if (i >= startingLayouts.length) {
    //   // Add controlled diversity to the first generation
    //   for (const box of ind) {
    //     box.x = rand() * Math.sqrt(base.length / 2)
    //     box.y = rand() * Math.sqrt(base.length / 2)
    //   }
    // }

    if (i >= startingLayouts.length && cfg.initialMutation) {
      mutateChild(ind, rand, cfg, cfg.mutate)
    }

    ind = fixOverlaps(ind, cfg)

    if (cfg.normalize) normalizeLayouts(ind)

    individuals.push({ id: i, gen: 0, layouts: ind, fitness: undefined as any })
  }

  // Run fitness in parallel
  const fitnessPromises = individuals.map((ind) => {
    ;(ind.layouts as any)._popId = ind.id
    ;(ind.layouts as any)._popGen = ind.gen
    const result = getFitness
      ? getFitness(ind.layouts, lines, cfg)
      : fitness(ind.layouts, lines, cfg)

    return Promise.resolve(result).then((value) => {
      ind.fitness = value
      return value
    })
  })

  await Promise.all(fitnessPromises)

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

function randInt(min: number, max: number, rand: () => number) {
  return Math.floor(rand() * (max - min + 1)) + min
}

function randGausInt(min: number, max: number, rand: () => number) {
  return randInt(min, max, () => Math.abs(randGaussian(0, 1, rand)))
}

function mutateChild(
  child: Box[],
  rand: () => number,
  cfg: Required<Config>,
  effectiveMutate: number,
) {
  const entities = toEntities(child)
  const targetEntity: LayoutEntity =
    entities[Math.floor(rand() * entities.length) % entities.length]
  const childMutatedBoxId = targetEntity.members[0].box.id

  const mutIdx = roulette(
    [
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
    ],
    rand,
  )

  const childMutation = MUTATION_NAMES[mutIdx]
  const mxy = rand()
  const [_x, _y, w, h] = getViewPort(child)
  const mutateX = w * effectiveMutate
  const mutateY = h * effectiveMutate
  const maxX = Math.round((0.5 * mutateX) / cfg.gridX)
  const maxY = Math.round((0.5 * mutateY) / cfg.gridY)

  const half = cfg.mutateXYOverlap / 2
  const x = mxy < 0.5 + half || mutIdx === 8 ? randGausInt(1, maxX, rand) * cfg.gridX : 0
  const y = mxy > 0.5 - half || mutIdx === 9 ? randGausInt(1, maxY, rand) * cfg.gridY : 0

  if (mutIdx === 0) {
    const quadrant = Math.floor(rand() * 4)
    mutateByQuadrant(targetEntity, entities, { x, y }, quadrant)
  } else if (mutIdx === 1) {
    mutateSingle(targetEntity, { x, y })
  } else if (mutIdx === 2) {
    mutateWithChildren(targetEntity, entities, { x, y }, cfg.maxChildren)
  } else if (mutIdx === 3) {
    mutateWithParents(targetEntity, entities, { x, y }, cfg.maxParents)
  } else if (mutIdx === 4) {
    mutateSwapSibling(targetEntity, entities, rand)
  } else if (mutIdx === 5) {
    mutateSwapRandom(targetEntity, entities, rand)
  } else if (mutIdx === 6) {
    mutateSwapInRow(targetEntity, entities, rand, cfg)
  } else if (mutIdx === 7) {
    mutateSwapInCol(targetEntity, entities, rand, cfg)
  } else if (mutIdx === 8) {
    mutateShiftRow(targetEntity, entities, { x })
  } else {
    mutateShiftCol(targetEntity, entities, { y })
  }
  return { child, childMutatedBoxId, childMutation }
}

async function runGenetic(
  startingLayouts: Box[][],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  getFitness?: (layouts: Box[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
  onIntermediate?: (layouts: Box[]) => void,
  onGenerationEnd?: (stop: number, snapshot?: GenerationSnapshot) => void,
  logProgress?: (...args) => void,
  logInfo?: (...args) => void,
  onMonitorEnd?: (monitor: RunMonitor) => void,
): Promise<Box[]> {
  // Create population
  let population = await createPopulation(startingLayouts, lines, rand, cfg, getFitness)

  // If all boxes were stripped (e.g. ignoreOrphans + no lines), return empty
  if (population[0].layouts.length === 0) {
    if (logInfo) {
      logInfo('No boxes!')
    }

    return []
  }

  const initialFitness = getFitness
    ? await getFitness(population[0].layouts, lines, cfg)
    : fitness(population[0].layouts, lines, cfg)
  if (logInfo)
    logInfo(
      `Initial fitness ${initialFitness.score.toFixed(0)}\n${JSON.stringify(initialFitness, null, 2)}`,
    )

  const bestInitIdx = population.reduce(
    (bi, ind, i) => (ind.fitness!.score < population[bi].fitness!.score ? i : bi),
    0,
  )
  let bestFitnessScore = population[bestInitIdx].fitness!.score
  let bestFitness: Fitness | undefined = population[bestInitIdx].fitness
  let bestIndividual: Box[] = cloneLayouts(population[bestInitIdx].layouts)

  if (logInfo) logInfo('Starting genetic layout optimization...')
  let stop = cfg.stop
  let lastProgressLog = 0
  const monitor = createRunMonitor()
  let stagnation = 0
  let nextPopId = cfg.popSize

  for (let gen = 0; gen < cfg.generations; gen++) {
    const fitnessPromises = population.map(async (ind) => {
      if (ind.fitness === undefined) {
        ;(ind.layouts as any)._popId = ind.id
        ;(ind.layouts as any)._popGen = ind.gen
        ;(ind.layouts as any)._popPrevId = ind.prevId
        ;(ind.layouts as any)._popPrevGen = ind.prevGen
        ind.fitness = getFitness
          ? await getFitness(ind.layouts, lines, cfg)
          : fitness(ind.layouts, lines, cfg)
      }

      return ind.fitness
    })

    const fitnessValues = await Promise.all(fitnessPromises)

    if (cfg.nichingEnabled) {
      applyFitnessSharing(population, cfg.nichingRadius, cfg.nichingExponent)
    }

    // Track global best
    const minScore = Math.min(...fitnessValues.map(({ score }) => score))
    const currentBestIdx = fitnessValues.findIndex(({ score }) => score === minScore)

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
      stop = cfg.stop
      stagnation = 0
      // record lineage event
      const newBest = population[currentBestIdx]
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
      effectiveMutate = cfg.mutate * Math.min(2, boost)
      // effectiveMutationRate = Math.min(
      //   1,
      //   cfg.mutationRate + (1 - diversity) * cfg.diversityBoostFactor,
      // )
    }

    if (cfg.stagnationThreshold > 0 && stagnation >= cfg.stagnationThreshold) {
      effectiveMutationRate = Math.min(1, effectiveMutationRate * cfg.stagnationRate)
    }

    // --- monitoring: build and store snapshot ---
    const snapshot = buildGenerationSnapshot(
      gen,
      fitnessValues.map((f) => f.score),
      diversity,
      stagnation,
      genMutStats,
      effectiveMutationRate,
      effectiveMutate,
    )
    monitor.snapshots.push(snapshot)
    accumulateMutStats(monitor.runTotals, genMutStats)

    onGenerationEnd?.(stop, snapshot)

    if (!stop) {
      break
    }

    // Build next generation
    const newPopulation: Population[] = [
      {
        ...population[currentBestIdx],
        layouts: cloneLayouts(bestIndividual),
        fitness: bestFitness,
      },
    ] // elitism

    let populationCopy = [...population].splice(currentBestIdx, 1)

    // monitoring helper: track elite survival
    const trackEliteSurvival = (ind: Population) => {
      if (ind._mutation && monitor.runTotals[ind._mutation]) {
        monitor.runTotals[ind._mutation].survived++
      }
    }

    const bestByCollisions = minBy<Population>(populationCopy, (v) => v.fitness!.collisions)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCollisions), 1)
    trackEliteSurvival(bestByCollisions)
    newPopulation.push(bestByCollisions)

    const bestByCrossings = minBy<Population>(populationCopy, (v) => v.fitness!.crossings)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCrossings), 1)
    trackEliteSurvival(bestByCrossings)
    newPopulation.push(bestByCrossings)

    const bestByOverlaps = minBy<Population>(populationCopy, (v) => v.fitness!.overlaps)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByOverlaps), 1)
    trackEliteSurvival(bestByOverlaps)
    newPopulation.push(bestByOverlaps)

    const bestByLength = minBy<Population>(populationCopy, (v) => v.fitness!.length)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByLength), 1)
    trackEliteSurvival(bestByLength)
    newPopulation.push(bestByLength)

    const bestByScore = minBy<Population>(populationCopy, (v) => v.fitness!.score)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByScore), 1)
    trackEliteSurvival(bestByScore)
    newPopulation.push(bestByScore)

    const bestByView = minBy<Population>(populationCopy, (v) => v.fitness!.view)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByView), 1)
    trackEliteSurvival(bestByView)
    newPopulation.push(bestByView)

    // const props = <(keyof Fitness)[]>['score', 'view', 'crossings']
    const props = <(keyof Fitness)[]>['score', 'view']
    // const props = <(keyof Fitness)[]>['score']

    const selected = []

    while (newPopulation.length < cfg.popSize) {
      const i1 = tournamentSelect(
        population,
        props[newPopulation.length % props.length],
        rand,
        cfg,
        selected,
      )
      const p1 = population[i1]
      selected.push(i1)

      let child: Box[]
      let childMutation: string = 'none'
      let childMutatedBoxId: string = ''
      if (rand() < cfg.crossoverRate) {
        const i2 = tournamentSelect(
          population,
          props[(newPopulation.length + 1) % props.length],
          rand,
          cfg,
          [i1],
        )

        const crossWeights = [cfg.crossWeightRandom, cfg.crossWeightStruct]
        const sw = singleWeight(crossWeights)
        const crossoverIdx = sw !== -1 ? sw : roulette(crossWeights, rand)

        if (crossoverIdx === 0) {
          child = crossover(p1.layouts, population[i2].layouts, rand, cfg)
          childMutation = 'crossover'
        } else {
          child = crossoverStructural(p1.layouts, population[i2].layouts, rand)
          childMutation = 'crossoverStructural'
        }
      } else {
        child = cloneLayouts(p1.layouts)
        // child = cloneLayouts(population[randInt(1, population.length - 1, rand)].layouts)

        if (rand() < effectiveMutationRate) {
          const __ret = mutateChild(child, rand, cfg, effectiveMutate)
          child = __ret.child
          childMutatedBoxId = __ret.childMutatedBoxId
          childMutation = __ret.childMutation
        }
      }

      // Increment per-box mutation counts (monitoring, doesn't affect algorithm)
      if (
        childMutation !== 'crossover' &&
        childMutation !== 'crossoverStructural' &&
        childMutation !== 'none' &&
        childMutatedBoxId
      ) {
        const box = child.find((b) => b.id === childMutatedBoxId)
        if (box) {
          box._mutations = {
            ...box._mutations,
            [childMutation]: (box._mutations?.[childMutation] ?? 0) + 1,
          }
        }
      }

      // child = fixOverlaps(child, cfg)

      if (cfg.normalize) normalizeLayouts(child)

      newPopulation.push({
        id: nextPopId++,
        gen: gen + 1,
        prevId: p1.id,
        prevGen: p1.gen,
        layouts: child,
        _mutation: childMutation,
        _mutatedBoxId: childMutatedBoxId,
        _parentScore: p1.fitness!.score,
        lastMutation: childMutation,
      })
    }

    population = newPopulation
  }

  if (logInfo)
    logInfo(
      `Optimization finished. Final fitness: ${bestFitnessScore.toFixed(0)}\n${JSON.stringify(bestFitness, null, 2)}`,
    )

  // Finalize monitor
  const sortedFinal = [...population]
    .filter((ind) => ind.fitness !== undefined)
    .sort((a, b) => a.fitness!.score - b.fitness!.score)
  monitor.deadWeightMutations = computeDeadWeightMutations(sortedFinal, monitor.runTotals)
  onMonitorEnd?.(monitor)

  return bestIndividual
}

export default runGenetic
