import { type Fitness } from './fitness.ts'

const NICHING_DIMS: (keyof Fitness)[] = [
  'score',
  'crossings',
  'overlaps',
  'collisions',
  'length',
  'area',
  'minDist',
  'view',
]

export function fitnessDistance(a: Fitness, b: Fitness): number {
  let sum = 0
  for (const d of NICHING_DIMS) {
    const diff = (a[d] as number) - (b[d] as number)
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

function sh(d: number, sigma: number, alpha: number): number {
  return d < sigma ? 1 - Math.pow(d / sigma, alpha) : 0
}

export function applyFitnessSharing(
  population: { fitness?: Fitness }[],
  sigma: number,
  alpha: number,
): void {
  const fitnesses = population.map((ind) => ind.fitness!)
  for (let i = 0; i < fitnesses.length; i++) {
    let nicheCount = 0
    for (let j = 0; j < fitnesses.length; j++) {
      nicheCount += sh(fitnessDistance(fitnesses[i], fitnesses[j]), sigma, alpha)
    }
    fitnesses[i].sharedFitness = fitnesses[i].score * Math.max(1, nicheCount)
  }
}
