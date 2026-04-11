import { type Config } from './config.ts'
import {
  type BoxLayout,
  type Line,
  type GroupPlan,
  fixOverlaps,
  normalizeLayouts,
  alignGroups,
} from './layout.ts'
import { type Fitness, fitness } from './fitness.ts'
import {
  cloneLayouts,
  crossover,
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

interface Layouts {
  layouts: BoxLayout[]
  fitness?: Fitness
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

function tournamentSelect(
  population: Layouts[],
  prop: keyof Fitness,
  rand: () => number,
  cfg: Required<Config>,
  exclude?: number[],
): number {
  const [initial, ...rest] = uniqueIndexes(
    Math.round(cfg.tournamentSize * population.length),
    0,
    population.length,
    rand,
    exclude,
  )
  let bestIdx = initial

  for (const candidate of rest) {
    if (population[candidate].fitness![prop] < population[bestIdx].fitness![prop]) {
      bestIdx = candidate
    }
  }

  return bestIdx
}

export async function createPopulation(
  startingLayouts: BoxLayout[][],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  groupPlan: GroupPlan,
  getFitness?: (layouts: BoxLayout[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
) {
  const individuals: Layouts[] = []

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

    ind = fixOverlaps(ind, cfg)

    if (cfg.keepGroups) alignGroups(ind, groupPlan)
    if (cfg.normalize) normalizeLayouts(ind)

    individuals.push({ layouts: ind, fitness: undefined as any })
  }

  // Run fitness in parallel
  const fitnessPromises = individuals.map((ind) => {
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

async function runGenetic(
  startingLayouts: BoxLayout[][],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  groupPlan: GroupPlan,
  getFitness?: (layouts: BoxLayout[], lines: Line[], cfg: Required<Config>) => Promise<Fitness>,
  onIntermediate?: (layouts: BoxLayout[]) => void,
  onGenerationEnd?: (stop: number, snapshot?: GenerationSnapshot) => void,
  logProgress?: (...args) => void,
  logInfo?: (...args) => void,
  onMonitorEnd?: (monitor: RunMonitor) => void,
): Promise<BoxLayout[]> {
  // Create population
  let population = await createPopulation(startingLayouts, lines, rand, cfg, groupPlan, getFitness)

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
  let bestIndividual: BoxLayout[] = cloneLayouts(population[bestInitIdx].layouts)

  if (logInfo) logInfo('Starting genetic layout optimization...')
  let stop = cfg.stop
  let lastProgressLog = 0
  const monitor = createRunMonitor()
  let stagnation = 0

  for (let gen = 0; gen < cfg.generations; gen++) {
    const fitnessPromises = population.map(async (ind) => {
      if (ind.fitness === undefined) {
        ind.fitness = getFitness
          ? await getFitness(ind.layouts, lines, cfg)
          : fitness(ind.layouts, lines, cfg)
      }

      return ind.fitness
    })

    const fitnessValues = await Promise.all(fitnessPromises)

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

    // --- monitoring: build and store snapshot ---
    const diversity = computePopulationDiversity(population, cfg)
    const snapshot = buildGenerationSnapshot(
      gen,
      fitnessValues.map((f) => f.score),
      diversity,
      stagnation,
      genMutStats,
    )
    monitor.snapshots.push(snapshot)
    accumulateMutStats(monitor.runTotals, genMutStats)

    onGenerationEnd?.(stop, snapshot)

    if (!stop) {
      break
    }

    // Build next generation
    const newPopulation: Layouts[] = [
      {
        layouts: cloneLayouts(bestIndividual),
        fitness: bestFitness,
      },
    ] // elitism

    let populationCopy = [...population].splice(currentBestIdx, 1)

    // monitoring helper: track elite survival
    const trackEliteSurvival = (ind: Layouts) => {
      if (ind._mutation && monitor.runTotals[ind._mutation]) {
        monitor.runTotals[ind._mutation].survived++
      }
    }

    const bestByCollisions = minBy<Layouts>(populationCopy, (v) => v.fitness!.collisions)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCollisions), 1)
    trackEliteSurvival(bestByCollisions)
    newPopulation.push(bestByCollisions)

    const bestByCrossings = minBy<Layouts>(populationCopy, (v) => v.fitness!.crossings)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCrossings), 1)
    trackEliteSurvival(bestByCrossings)
    newPopulation.push(bestByCrossings)

    const bestByOverlaps = minBy<Layouts>(populationCopy, (v) => v.fitness!.overlaps)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByOverlaps), 1)
    trackEliteSurvival(bestByOverlaps)
    newPopulation.push(bestByOverlaps)

    const bestByLength = minBy<Layouts>(populationCopy, (v) => v.fitness!.length)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByLength), 1)
    trackEliteSurvival(bestByLength)
    newPopulation.push(bestByLength)

    const bestByScore = minBy<Layouts>(populationCopy, (v) => v.fitness!.score)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByScore), 1)
    trackEliteSurvival(bestByScore)
    newPopulation.push(bestByScore)

    const bestByView = minBy<Layouts>(populationCopy, (v) => v.fitness!.view)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByView), 1)
    trackEliteSurvival(bestByView)
    newPopulation.push(bestByView)

    // const props = <(keyof Fitness)[]>['score', 'view', 'crossings']
    const props = <(keyof Fitness)[]>['score', 'view']
    // const props = <(keyof Fitness)[]>['score']

    while (newPopulation.length < cfg.popSize) {
      const i1 = tournamentSelect(population, props[newPopulation.length % props.length], rand, cfg)
      const p1 = population[i1]

      let child: BoxLayout[]
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
        child = crossover(p1.layouts, population[i2].layouts, rand, cfg)
        childMutation = 'crossover'
      } else {
        child = cloneLayouts(p1.layouts)

        if (rand() < cfg.mutationRate) {
          const mutationTarget = child[Math.floor(rand() * child.length)]
          childMutatedBoxId = mutationTarget.id

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

          childMutation = MUTATION_NAMES[mutIdx]

          const mxy = rand()
          const [_x, _y, w, h] = getViewPort(child)
          const mutateX = w * cfg.mutate
          const mutateY = h * cfg.mutate
          const x =
            mxy < 0.6 || mutIdx === 8
              ? Math.round(((rand() - 0.5) * mutateX) / cfg.gridX) * cfg.gridX
              : 0
          const y =
            mxy > 0.4 || mutIdx === 9
              ? Math.round(((rand() - 0.5) * mutateY) / cfg.gridY) * cfg.gridY
              : 0

          if (mutIdx === 0) {
            const quadrant = Math.floor(rand() * 4)
            child = mutateByQuadrant(mutationTarget, child, { x, y }, quadrant)
          } else if (mutIdx === 1) {
            child = mutateSingle(mutationTarget, child, { x, y })
          } else if (mutIdx === 2) {
            child = mutateWithChildren(mutationTarget, child, { x, y }, cfg.maxChildren)
          } else if (mutIdx === 3) {
            child = mutateWithParents(mutationTarget, child, { x, y }, cfg.maxParents)
          } else if (mutIdx === 4) {
            child = mutateSwapSibling(mutationTarget, child, rand)
          } else if (mutIdx === 5) {
            child = mutateSwapRandom(mutationTarget, child, rand)
          } else if (mutIdx === 6) {
            child = mutateSwapInRow(mutationTarget, child, rand, cfg)
          } else if (mutIdx === 7) {
            child = mutateSwapInCol(mutationTarget, child, rand, cfg)
          } else if (mutIdx === 8) {
            child = mutateShiftRow(mutationTarget, child, { x })
          } else {
            child = mutateShiftCol(mutationTarget, child, { y })
          }
        }
      }

      // child = fixOverlaps(child, cfg)

      if (cfg.keepGroups) alignGroups(child, groupPlan)
      if (cfg.normalize) normalizeLayouts(child)

      newPopulation.push({
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
