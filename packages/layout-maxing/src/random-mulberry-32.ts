// Deterministic random (Mulberry32 - fixed seed guarantees identical runs)
export function getRandomMulberry(seed: number): () => number {
  let state = seed

  return () => {
    let t = (state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
