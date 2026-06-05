import { type Fitness } from './fitness-optimized.ts'

// Niching distance describes structural diversity, not score. Selection already
// uses score via sharedFitness = score * nicheCount, so including score in the
// distance would double-count it.
const NICHING_DIMS: (keyof Fitness)[] = ['crossings', 'overlaps', 'collisions', 'length', 'area', 'minDist', 'view']

function sh(d: number, sigma: number, alpha: number): number {
  return d < sigma ? 1 - Math.pow(d / sigma, alpha) : 0
}

export function applyFitnessSharing(population: { fitness?: Fitness }[], sigma: number, alpha: number): void {
  const fitnesses = population.map((ind) => ind.fitness!)
  // Normalize each dimension by its population max so nichingRadius is scale-independent
  const norms: number[] = NICHING_DIMS.map((d) => Math.max(1, ...fitnesses.map((f) => Math.abs(f[d] as number))))
  for (let i = 0; i < fitnesses.length; i++) {
    let nicheCount = 0
    for (let j = 0; j < fitnesses.length; j++) {
      let sum = 0
      for (let k = 0; k < NICHING_DIMS.length; k++) {
        const diff = ((fitnesses[i][NICHING_DIMS[k]] as number) - (fitnesses[j][NICHING_DIMS[k]] as number)) / norms[k]
        sum += diff * diff
      }
      nicheCount += sh(Math.sqrt(sum), sigma, alpha)
    }
    fitnesses[i].sharedFitness = fitnesses[i].score * Math.max(1, nicheCount)
  }
}
