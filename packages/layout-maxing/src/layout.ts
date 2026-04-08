import dagre from '@dagrejs/dagre'
import { type Config } from './config.ts'

type BoxId = string

export interface Line {
  patchline: {
    destination: [BoxId, number]
    source: [BoxId, number]
    midpoints?: number[]
  }
}

// Simplified layout data used by the genetic algorithm
export type BoxLayout = {
  id: BoxId
  index: number
  x: number
  y: number
  width: number
  height: number
  numInlets: number
  numOutlets: number
  depth?: number
  children?: number[]
  parents?: number[]
}

interface Box {
  box: {
    id: BoxId
    patching_rect: [number, number, number, number]
    numinlets?: number
    numoutlets?: number
    rnboinfo: {
      inputs: Array<unknown>
      outputs: Array<unknown>
    }
  }
}

export interface Patcher {
  appversion: Record<string, string | number>
  boxes: Box[]
  lines: Line[]
  boxgroups?: Array<{ boxes: BoxId[] }>
}

// Shift so min x=0 and min y=0 (top-left aligned to origin)
export function normalizeLayouts(layouts: BoxLayout[]): void {
  if (layouts.length === 0) return
  let minX = Infinity
  let minY = Infinity
  for (const l of layouts) {
    if (l.x < minX) minX = l.x
    if (l.y < minY) minY = l.y
  }
  for (const l of layouts) {
    l.x -= minX
    l.y -= minY
  }
}

// Returns a filtered array (orphans removed) + re-indexes.
// Requires fillDepths() to have been called so depth === -1 marks orphans.
export function stripOrphans(layouts: BoxLayout[]): BoxLayout[] {
  const kept = layouts.filter((l) => l.depth !== -1)
  kept.forEach((l, i) => (l.index = i))
  return kept
}

export type GroupPlan = Array<{
  leaderId: BoxId
  members: Array<{ id: BoxId; dx: number; dy: number }>
}>

// Capture relative offsets of each group member to its leader (first box).
// Uses stable BoxId so callers don't have to worry about array reordering
// (e.g. fixOverlaps sorts the array and breaks positional indexing).
export function buildGroupPlan(
  layouts: BoxLayout[],
  boxgroups: Array<{ boxes: BoxId[] }> | undefined,
): GroupPlan {
  if (!boxgroups?.length) return []
  const byId = new Map(layouts.map((l) => [l.id, l]))
  const plan: GroupPlan = []
  for (const g of boxgroups) {
    const present = g.boxes.map((id) => byId.get(id)).filter(Boolean) as BoxLayout[]
    if (present.length < 2) continue
    const leader = present[0]
    plan.push({
      leaderId: leader.id,
      members: present.slice(1).map((m) => ({
        id: m.id,
        dx: m.x - leader.x,
        dy: m.y - leader.y,
      })),
    })
  }
  return plan
}

// Snap each group member's position to leader + captured offset.
export function alignGroups(layouts: BoxLayout[], plan: GroupPlan): void {
  if (plan.length === 0) return
  const byId = new Map(layouts.map((l) => [l.id, l]))
  for (const g of plan) {
    const leader = byId.get(g.leaderId)
    if (!leader) continue
    for (const m of g.members) {
      const member = byId.get(m.id)
      if (!member) continue
      member.x = leader.x + m.dx
      member.y = leader.y + m.dy
    }
  }
}

export function fillDepths(layouts: BoxLayout[], lines: Line[]): void {
  // Create quick lookup: id → BoxLayout
  const boxMap = new Map<BoxId, BoxLayout>()
  for (const box of layouts) {
    boxMap.set(box.id, box)

    // Initialize new properties
    box.parents = []
    box.children = []
    box.depth = 0
  }

  // Build incoming (parents) and outgoing (children) graphs
  const incoming = new Map<BoxId, BoxId[]>()
  const outgoing = new Map<BoxId, BoxId[]>()

  for (const line of lines) {
    const [srcId] = line.patchline.source
    const [destId] = line.patchline.destination

    if (!boxMap.has(srcId) || !boxMap.has(destId)) continue

    // Parents of destination
    if (!incoming.has(destId)) incoming.set(destId, [])
    incoming.get(destId)!.push(srcId)

    // Children of source
    if (!outgoing.has(srcId)) outgoing.set(srcId, [])
    outgoing.get(srcId)!.push(destId)
  }

  // Fill parents and children arrays with actual BoxLayout references
  for (const box of layouts) {
    const parentIds = incoming.get(box.id) || []
    const childIds = outgoing.get(box.id) || []

    box.parents = parentIds.map((id) => boxMap.get(id)!.index)
    box.children = childIds.map((id) => boxMap.get(id)!.index)
  }

  // Memoization for depth calculation (longest path from root)
  const memo = new Map<BoxId, number>()
  const visiting = new Set<BoxId>()

  function getDepth(boxId: BoxId): number {
    if (memo.has(boxId)) {
      return memo.get(boxId)!
    }

    if (visiting.has(boxId)) {
      return 0 // cycle detected — break it
    }

    const parents = incoming.get(boxId) || []

    if (parents.length === 0) {
      memo.set(boxId, 0)
      return 0
    }

    visiting.add(boxId)
    let maxParentDepth = -1
    for (const parentId of parents) {
      const parentDepth = getDepth(parentId)
      if (parentDepth > maxParentDepth) {
        maxParentDepth = parentDepth
      }
    }
    visiting.delete(boxId)

    const depth = maxParentDepth + 1
    memo.set(boxId, depth)
    return depth
  }

  // Compute depth for every box
  for (const box of layouts) {
    box.depth = getDepth(box.id)
  }

  // Mark truly isolated boxes (no parents AND no children) with depth = -1
  for (const box of layouts) {
    if (box.parents!.length === 0 && box.children!.length === 0) {
      box.depth = -1
    }
  }
}

export function layoutShrink(layouts: BoxLayout[], stepY: number) {
  const rows = new Map<number, BoxLayout[]>()

  for (const l of layouts) {
    if (rows.has(l.y)) {
      rows.get(l.y)!.push(l)
    } else {
      rows.set(l.y, [l])
    }
  }

  let y = 0

  for (const [, ls] of rows
    .entries()
    .toArray()
    .toSorted(([a], [b]) => a - b)) {
    for (const l of ls) {
      l.y = y
    }

    y += stepY
  }
}

function boxesOverlap(a: BoxLayout, b: BoxLayout): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

export function fixOverlaps(layouts: BoxLayout[], cfg: Required<Config>): BoxLayout[] {
  const fixed = layouts.map((l) => ({ ...l }))

  // Initial grid snap
  fixed.forEach((b) => {
    b.x = Math.round(b.x / cfg.gridX) * cfg.gridX
    b.y = Math.round(b.y / cfg.gridY) * cfg.gridY
  })

  let changed = true
  let iterations = 0
  const MAX_ITER = 30

  while (changed && iterations < MAX_ITER) {
    changed = false
    iterations++

    // Sort by row (Y) then column (X) as requested
    fixed.sort((a, b) => a.y - b.y || a.x - b.x)

    for (let i = 0; i < fixed.length; i++) {
      for (let j = 0; j < i; j++) {
        const curr = fixed[i]
        const prev = fixed[j]

        if (boxesOverlap(curr, prev)) {
          const overlapX = Math.max(
            0,
            Math.min(curr.x + curr.width, prev.x + prev.width) - Math.max(curr.x, prev.x),
          )
          const overlapY = Math.max(
            0,
            Math.min(curr.y + curr.height, prev.y + prev.height) - Math.max(curr.y, prev.y),
          )

          // Prefer shifting right when X-overlap is smaller or equal; otherwise down (follows "right/bottom" heuristic)
          if (overlapX <= overlapY || overlapY === 0) {
            curr.x = prev.x + prev.width + cfg.minDistX
          } else {
            curr.y = prev.y + prev.height + cfg.minDistY
          }
          changed = true
        }
      }
    }
  }

  // Final grid snap (no shrinking implemented - boxes keep original size)
  fixed.forEach((b) => {
    b.x = Math.ceil(b.x / cfg.gridX) * cfg.gridX
    b.y = Math.round(b.y / cfg.gridY) * cfg.gridY
  })

  layoutShrink(fixed, cfg.gridY)

  return fixed
}

export function createInitialLayouts(patcher: Patcher): BoxLayout[] {
  return patcher.boxes.map((b: Box, index) => {
    const data = b.box
    return {
      id: data.id,
      index,
      x: data.patching_rect[0],
      y: data.patching_rect[1],
      width: data.patching_rect[2],
      height: data.patching_rect[3],
      numInlets: data?.numinlets ?? data?.rnboinfo?.inputs?.length ?? 0,
      numOutlets: data?.numoutlets ?? data?.rnboinfo?.outputs?.length ?? 0,
    }
  })
}

export function simpleFlow(baseLayouts: BoxLayout[], cfg: Required<Config>) {
  const cols: Record<string, BoxLayout[]> = {}

  for (const l of baseLayouts) {
    l.y = l.depth! * cfg.gridY
    cols[l.depth!] = cols[l.depth!] || []
    const last = cols[l.depth!].at(-1) ?? { x: 0, width: 0 }
    l.x = last.x + last.width + cfg.gridX
    cols[l.depth!].push(l)
  }
}

export function dagreFlow(
  layouts: BoxLayout[],
  lines: Line[],
  rankdir: 'TB' | 'LR' | 'BT' | 'RL' = 'TB',
) {
  // Create a new directed graph
  const g = new dagre.graphlib.Graph()

  // Set an object for the graph label
  g.setGraph({ align: 'UL', rankdir, ranker: 'longest-path' })

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {}
  })

  for (const l of layouts) {
    g.setNode(l.id, l)
  }

  for (const l of lines) {
    g.setEdge(l.patchline.source[0], l.patchline.destination[0])
  }

  dagre.layout(g)
}
