import { type Box, type Line } from './layout.ts'

export interface Cluster {
  boxIdxs: Set<number>
}

// Detect clusters bottom-up via greedy min-cut growth.
// Requires fillDepths() to have populated parents/children/depth on every box.
// Boxgroup members (sharing groupIdx) are forced into the same cluster.
// Returned clusters are ordered deepest-first (process order for sequential GA).
export function detectClusters(boxes: Box[], _lines: Line[], maxSize: number, maxSizeIsolated = maxSize): Cluster[] {
  if (maxSize <= 0 || boxes.length === 0) return []

  const n = boxes.length
  const groupOf = new Map<number, number[]>() // groupIdx → list of box indices
  for (const b of boxes) {
    if (b.groupIdx !== undefined) {
      const list = groupOf.get(b.groupIdx) ?? []
      list.push(b.index)
      groupOf.set(b.groupIdx, list)
    }
  }

  const seedSizeOf = (boxIdx: number): number[] => {
    const b = boxes[boxIdx]
    if (b.groupIdx !== undefined) return groupOf.get(b.groupIdx) ?? [boxIdx]
    return [boxIdx]
  }

  const assigned = Array.from<boolean>({ length: n }).fill(false)

  // Sort candidate seeds: deepest first; among equal depth, fewer outgoing first (true leaves).
  const seedOrder = boxes
    .map((b) => b.index)
    .sort((a, b) => {
      const db = (boxes[b].depth ?? 0) - (boxes[a].depth ?? 0)
      if (db !== 0) return db
      return (boxes[a].children?.length ?? 0) - (boxes[b].children?.length ?? 0)
    })

  const clusters: Cluster[] = []

  for (const seedIdx of seedOrder) {
    if (assigned[seedIdx]) continue
    const cluster = new Set<number>()

    const addAtomic = (idx: number) => {
      for (const m of seedSizeOf(idx)) {
        if (!assigned[m]) {
          cluster.add(m)
          assigned[m] = true
        }
      }
    }
    addAtomic(seedIdx)

    // Frontier = unassigned boxes adjacent to anything in `cluster`.
    // Greedy step: pick the frontier candidate maximizing (edges into cluster - edges out of cluster).
    while (cluster.size < maxSize) {
      const frontier = new Map<number, { incident: number; total: number }>()
      for (const idx of cluster) {
        const b = boxes[idx]
        for (const ni of [...(b.parents ?? []), ...(b.children ?? [])]) {
          if (assigned[ni]) continue
          if (cluster.has(ni)) continue
          if (!frontier.has(ni)) frontier.set(ni, { incident: 0, total: 0 })
        }
      }
      if (frontier.size === 0) break

      // Score each frontier candidate.
      let best: number | undefined
      let bestScore = -Infinity
      for (const [ni] of frontier) {
        const nb = boxes[ni]
        const neighbors = [...(nb.parents ?? []), ...(nb.children ?? [])]
        let inc = 0
        let total = neighbors.length
        for (const nn of neighbors) {
          if (cluster.has(nn)) inc++
        }
        // Score: incident edges (gained), minus dangling edges (cost).
        const dangling = total - inc
        const score = inc * 2 - dangling
        // Prefer atomic adds that don't overshoot too far.
        const atomic = seedSizeOf(ni)
        const overshoot = Math.max(0, cluster.size + atomic.length - maxSize)
        const adjusted = score - overshoot * 0.5
        if (adjusted > bestScore) {
          bestScore = adjusted
          best = ni
        }
      }
      if (best === undefined) break
      // Stop if adding would massively overshoot AND we already have ≥1 element.
      const atomic = seedSizeOf(best)
      if (cluster.size > 0 && cluster.size + atomic.length > maxSize * 1.5) break
      addAtomic(best)
    }

    // Absorb isolated frontier nodes (all their unassigned neighbors connect only back
    // into this cluster) up to maxSizeIsolated.
    if (maxSizeIsolated > maxSize) {
      let changed = true
      while (changed && cluster.size < maxSizeIsolated) {
        changed = false
        for (const idx of cluster) {
          for (const ni of [...(boxes[idx].parents ?? []), ...(boxes[idx].children ?? [])]) {
            if (assigned[ni]) continue
            const neighbors = [...(boxes[ni].parents ?? []), ...(boxes[ni].children ?? [])]
            const isolated = neighbors.every((nn) => cluster.has(nn) || assigned[nn])
            if (isolated) {
              const atomic = seedSizeOf(ni)
              if (cluster.size + atomic.length <= maxSizeIsolated) {
                addAtomic(ni)
                changed = true
              }
            }
          }
        }
      }
    }

    clusters.push({ boxIdxs: cluster })
  }

  return clusters
}

// True if line endpoints reference any box id in the given set.
export function lineTouches(line: Line, boxIds: Set<string>): boolean {
  return boxIds.has(line.patchline.source[0]) || boxIds.has(line.patchline.destination[0])
}

export function lineFullyInside(line: Line, boxIds: Set<string>): boolean {
  return boxIds.has(line.patchline.source[0]) && boxIds.has(line.patchline.destination[0])
}
