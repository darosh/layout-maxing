export function getRandomXoshiro(seed: number) {
  const MASK = (1n << 64n) - 1n

  function splitMix64(x: bigint): bigint {
    let z = (x + 0x9e3779b97f4a7c15n) & MASK
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK
    return (z ^ (z >> 31n)) & MASK
  }

  const state = new BigUint64Array(4)
  let x = BigInt(Math.trunc(seed * 1_000_000))

  const max = 1.1102230246251565e-16

  state[0] = splitMix64(x)
  state[1] = splitMix64(state[0])
  state[2] = splitMix64(state[1])
  state[3] = splitMix64(state[2])

  return function rand(): number {
    const s0 = state[0]
    const s1 = state[1]
    const s2 = state[2]
    const s3 = state[3]

    const result = (s0 + s3) & MASK
    const t = (s1 << 17n) & MASK

    state[2] = (s2 ^ s0) & MASK
    state[3] = (s3 ^ s1) & MASK
    state[1] = (s1 ^ state[2]) & MASK
    state[0] = (s0 ^ state[3]) & MASK

    state[2] = (state[2] ^ t) & MASK

    const s3n = state[3] & MASK
    state[3] = ((s3n << 45n) | (s3n >> 19n)) & MASK

    return Number(result >> 11n) * max
  }
}
