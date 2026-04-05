import { type Config } from './config.ts'
import { type BoxLayout, type Line, fixOverlaps } from './layout.ts'
import { type Fitness, fitness } from './fitness.ts'
import {
  cloneLayouts, mutate, crossover, mutateSingle, mutateWithChildren, mutateWithParents, mutateByQuadrant,
  mutateSwapSibling, mutateSwapRandom
} from './mutation.ts'
import { getViewPort } from './geometry.ts'

interface Layouts {
  layouts: BoxLayout[]
  fitness?: Fitness
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

function uniqueIndexes(count: number, min: number, max: number, rand: () => number, exclude?: number[]): number[] {
  const result: number[] = []
  const excluded = new Set(exclude)
  while (result.length < count) {
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
  const [initial, ...rest] = uniqueIndexes(Math.round(cfg.tournamentSize * population.length), 0, population.length, rand, exclude)
  let bestIdx = initial

  for (const candidate of rest) {
    if (population[candidate].fitness![prop] < population[bestIdx].fitness![prop]) {
      bestIdx = candidate
    }
  }

  return bestIdx
}

export async function createPopulation(
  baseLayouts: BoxLayout[],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  getFitness?: (layouts: BoxLayout[], lines: Line[]) => Promise<Fitness>,
) {
  const individuals: Layouts[] = []

  for (let i = 0; i < cfg.popSize; i++) {
    let ind = cloneLayouts(baseLayouts)

    if (i > 0) {
      // Add controlled diversity to the first generation
      for (const box of ind) {
        box.x = rand() * Math.sqrt(baseLayouts.length / 2)
        box.y = rand() * Math.sqrt(baseLayouts.length / 2)
      }
    }

    ind = fixOverlaps(ind, cfg)

    individuals.push({ layouts: ind, fitness: undefined as any })
  }

  // Run fitness in parallel
  const fitnessPromises = individuals.map((ind) => {
    const result = getFitness ? getFitness(ind.layouts, lines) : fitness(ind.layouts, lines, cfg)

    return Promise.resolve(result).then((value) => {
      ind.fitness = value
      return value
    })
  })

  await Promise.all(fitnessPromises)

  return individuals
}

async function runGenetic(
  baseLayouts: BoxLayout[],
  lines: Line[],
  rand: () => number,
  cfg: Required<Config>,
  getFitness?: (layouts: BoxLayout[], lines: Line[]) => Promise<Fitness>,
  onIntermediate?: (layouts: BoxLayout[]) => void,
  onGenerationEnd?: (stop: number) => void,
  log?: (...args) => void,
): Promise<BoxLayout[]> {
  // Create population
  let population = await createPopulation(baseLayouts, lines, rand, cfg, getFitness)
  const initialFitness = getFitness
    ? await getFitness(population[0].layouts, lines)
    : fitness(population[0].layouts, lines, cfg)
  log &&
    log(`Initial fitness ${initialFitness.score.toFixed(0)}\n${JSON.stringify(initialFitness)}`)

  let bestFitnessScore = Infinity
  let bestFitness = undefined
  let bestGen = 0
  let bestIndividual: BoxLayout[] = cloneLayouts(baseLayouts)

  log && log('Starting genetic layout optimization...')
  let stop = cfg.stop

  for (let gen = 0; gen < cfg.generations; gen++) {
    const fitnessPromises = population.map(async (ind) => {
      if (ind.fitness === undefined) {
        ind.fitness = getFitness
          ? await getFitness(ind.layouts, lines)
          : fitness(ind.layouts, lines, cfg)
      }

      return ind.fitness
    })

    const fitnessValues = await Promise.all(fitnessPromises)

    // Track global best
    const minScore = Math.min(...fitnessValues.map(({ score }) => score))
    const currentBestIdx = fitnessValues.findIndex(({ score }) => score === minScore)

    if (fitnessValues[currentBestIdx].score < bestFitnessScore) {
      bestFitness = fitnessValues[currentBestIdx]
      bestFitnessScore = bestFitness.score
      bestIndividual = cloneLayouts(population[currentBestIdx].layouts)
      bestGen = gen
      stop = cfg.stop
    } else {
      stop--
      if (stop === cfg.svgAtStop && onIntermediate) {
        onIntermediate(bestIndividual)
      }
    }

    if (gen % 20 === 0 || gen === cfg.generations - 1) {
      log &&
        log(
          `GEN: ${gen + 1} | SCO: ${bestFitnessScore.toFixed(0)} | COL/OVE/CRO/ARE ${bestFitness?.collisions}/${bestFitness?.overlaps}/${bestFitness?.crossings}/${bestFitness?.area.toFixed(
            0,
          )} | STO: ${stop}`,
        )
    }

    onGenerationEnd?.(stop)

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

    const bestByCollisions = minBy<Layouts>(populationCopy, (v) => v.fitness!.collisions)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCollisions), 1)
    newPopulation.push(bestByCollisions)

    const bestByCrossings = minBy<Layouts>(populationCopy, (v) => v.fitness!.crossings)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByCrossings), 1)
    newPopulation.push(bestByCrossings)

    const bestByOverlaps = minBy<Layouts>(populationCopy, (v) => v.fitness!.overlaps)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByOverlaps), 1)
    newPopulation.push(bestByOverlaps)

    const bestByLength = minBy<Layouts>(populationCopy, (v) => v.fitness!.length)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByLength), 1)
    newPopulation.push(bestByLength)

    const bestByScore = minBy<Layouts>(populationCopy, (v) => v.fitness!.score)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByScore), 1)
    newPopulation.push(bestByScore)

    const bestByView = minBy<Layouts>(populationCopy, (v) => v.fitness!.view)!
    populationCopy = populationCopy.splice(populationCopy.indexOf(bestByView), 1)
    rand() < .5 ? population : newPopulation.push(bestByView)

    const mutationRate = cfg.mutationRate + (gen - bestGen) * cfg.noProgressBoost

    // const props = <(keyof Fitness)[]>['score', 'view', 'crossings']
    const props = <(keyof Fitness)[]>['score', 'view']
    // const props = <(keyof Fitness)[]>['score']

    while (newPopulation.length < cfg.popSize) {
      const i1 = tournamentSelect(population, props[newPopulation.length % props.length], rand, cfg)
      const p1 = population[i1]

      let child: BoxLayout[]
      if (rand() < cfg.crossoverRate) {
        const i2 = tournamentSelect(population, props[(newPopulation.length + 1) % props.length], rand, cfg, [i1])
        child = crossover(p1.layouts, population[i2].layouts, rand, cfg)
      } else {
        child = cloneLayouts(p1.layouts)

        // Mutate child
        // child = mutate(child, mutationRate, rand, cfg)

        if (rand() < mutationRate) {
          const mxy = rand()
          const [ x_ , y_, w, h] = getViewPort(child)
          const mutateX = w * cfg.mutate
          const mutateY = h * cfg.mutate
          const x = mxy < 0.6 ? Math.round((rand() - 0.5) * mutateX / cfg.gridX) * cfg.gridX: 0
          const y = mxy > 0.4 ? Math.round((rand() - 0.5) * mutateY / cfg.gridY) * cfg.gridY : 0
          const r = rand()
          const mutationTarget = child[Math.floor(rand() * child.length)]

          if (r < .3) {
            const quadrant = Math.floor(rand() * 4)
            child = mutateByQuadrant(mutationTarget, child, { x, y }, quadrant)
          } else if (r < .4) {
            child = mutateSingle(mutationTarget, child, { x, y })
          } else if (r < .6) {
            child = mutateWithChildren(mutationTarget, child, { x, y }, cfg.maxChildren)
          } else if (r < .8) {
            child = mutateSwapSibling(mutationTarget, child, rand)
          } else {
            child = mutateSwapRandom(mutationTarget, child, rand)
          }
        }
      }

      newPopulation.push({ layouts: child })
    }

    population = newPopulation
  }

  log &&
    log(
      `Optimization finished. Final fitness: ${bestFitnessScore.toFixed(2)}\n${JSON.stringify(bestFitness)}`,
    )

  return bestIndividual
}

export default runGenetic
