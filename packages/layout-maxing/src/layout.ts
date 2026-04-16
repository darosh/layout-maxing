import dagre from '@dagrejs/dagre'
import type { ELK as ELKInstance, ElkNode } from 'elkjs/lib/elk-api.js'
import _ELKCtor from 'elkjs/lib/elk-api.js'
// elk-api.js is CJS — TS doesn't see the construct signature; cast explicitly.
const ELKCtor = _ELKCtor as unknown as new (args: { workerFactory: (url: string) => unknown; workerUrl: string }) => ELKInstance
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
export type Box = {
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
  groupIdx?: number
  _groupDx?: number // original x offset from group entity top-left (set once by stampGroupOffsets)
  _groupDy?: number // original y offset from group entity top-left
  _mutations?: Record<string, number> // monitoring: count of each mutation type that moved this box
}

interface PatcherBox {
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
  boxes: PatcherBox[]
  lines: Line[]
  boxgroups?: Array<{ boxes: BoxId[] }>
}

// Shift so min x=0 and min y=0 (top-left aligned to origin)
export function normalizeLayouts(layouts: Box[]): void {
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

export function isSnapped(layouts: Box[], { gridX, gridY }: Required<Config>): boolean {
  return layouts.every((l) => l.x % gridX === 0 && l.y % gridY === 0)
}

// Stamp groupIdx on layouts from raw boxgroups so fitness can skip same-group
// pairs. Safe to call before fillDepths/stripOrphans.
export function stampGroupIdx(layouts: Box[], boxgroups: Array<{ boxes: BoxId[] }> | undefined): void {
  if (!boxgroups?.length) return
  const byId = new Map(layouts.map((l) => [l.id, l]))
  boxgroups.forEach((g, i) => {
    for (const id of g.boxes) {
      const l = byId.get(id)
      if (l) l.groupIdx = i
    }
  })
}

// Capture each group member's original offset from the group bounding-box top-left.
// Must be called on baseLayouts BEFORE any layout algorithm (dagre etc.) shifts positions.
// These offsets are preserved through cloneLayouts and used by toEntities so that all
// mutations and fixOverlaps enforce the original group structure.
export function stampGroupOffsets(layouts: Box[], boxgroups: Array<{ boxes: BoxId[] }> | undefined): void {
  if (!boxgroups?.length) return
  const byId = new Map(layouts.map((l) => [l.id, l]))
  for (const g of boxgroups) {
    const present = g.boxes.map((id) => byId.get(id)).filter(Boolean) as Box[]
    if (present.length < 2) continue
    const minX = Math.min(...present.map((m) => m.x))
    const minY = Math.min(...present.map((m) => m.y))
    for (const m of present) {
      m._groupDx = m.x - minX
      m._groupDy = m.y - minY
    }
  }
}

// If a group has any connected member (depth ≥ 0), mark all its members as
// connected so stripOrphans won't remove them.
export function preserveGroupMembers(layouts: Box[], boxgroups: Array<{ boxes: BoxId[] }> | undefined): void {
  if (!boxgroups?.length) return
  const byId = new Map(layouts.map((l) => [l.id, l]))
  for (const g of boxgroups) {
    for (const id of g.boxes) {
      const l = byId.get(id)
      if (l) l.depth = Math.max(l.depth ?? -1, 0)
    }
  }
}

// Returns a filtered array (orphans removed) + re-indexes.
// Requires fillDepths() to have been called so depth === -1 marks orphans.
export function stripOrphans(layouts: Box[]): Box[] {
  const kept = layouts.filter((l) => l.depth !== -1)
  kept.forEach((l, i) => (l.index = i))
  return kept
}

// Atomic layout unit: either a standalone box (members.length === 1, groupIdx undefined)
// or a group's bounding box (groupIdx set, members has all group members with relative offsets).
// Moving the entity updates all member box coordinates via syncEntity.
export type LayoutEntity = {
  x: number // top-left of bounding box
  y: number
  width: number // bounding box dimensions
  height: number
  groupIdx?: number
  members: Array<{ box: Box; dx: number; dy: number }>
}

// Write entity x/y back to member boxes (member.box.x = entity.x + m.dx).
export function syncEntity(entity: LayoutEntity): void {
  for (const m of entity.members) {
    m.box.x = entity.x + m.dx
    m.box.y = entity.y + m.dy
  }
}

// Move entity to (x, y) and sync all members.
export function moveEntityTo(entity: LayoutEntity, x: number, y: number): void {
  entity.x = x
  entity.y = y
  syncEntity(entity)
}

// Swap positions of two entities, preserving each entity's internal member offsets.
export function swapEntities(a: LayoutEntity, b: LayoutEntity): void {
  const ax = a.x
  const ay = a.y
  moveEntityTo(a, b.x, b.y)
  moveEntityTo(b, ax, ay)
}

// Build entity list from current layouts.
// Groups (2+ members with same groupIdx) → one entity per groupIdx.
// Standalone boxes → trivial one-member entity.
export function toEntities(layouts: Box[]): LayoutEntity[] {
  const groupMap = new Map<number, Box[]>()
  const standalone: Box[] = []

  for (const box of layouts) {
    if (box.groupIdx !== undefined) {
      if (!groupMap.has(box.groupIdx)) groupMap.set(box.groupIdx, [])
      groupMap.get(box.groupIdx)!.push(box)
    } else {
      standalone.push(box)
    }
  }

  const entities: LayoutEntity[] = []

  for (const [groupIdx, members] of groupMap) {
    if (members.length < 2) {
      for (const box of members) standalone.push(box)
      continue
    }

    // Use stored offsets (set by stampGroupOffsets) when available.
    // The anchor is the member with _groupDx=0, _groupDy=0 (original top-left).
    // entity.x = anchor.x so that member.x = entity.x + _groupDx = anchor.x + _groupDx.
    // This enforces original relative positions regardless of where dagre/mutations placed boxes.
    const hasStoredOffsets = members.every((m) => m._groupDx !== undefined)
    if (hasStoredOffsets) {
      const anchor = members.find((m) => m._groupDx === 0 && m._groupDy === 0) ?? members[0]
      const entityX = anchor.x - (anchor._groupDx ?? 0)
      const entityY = anchor.y - (anchor._groupDy ?? 0)
      const entityW = Math.max(...members.map((m) => m._groupDx! + m.width))
      const entityH = Math.max(...members.map((m) => m._groupDy! + m.height))
      entities.push({
        x: entityX,
        y: entityY,
        width: entityW,
        height: entityH,
        groupIdx,
        members: members.map((m) => ({ box: m, dx: m._groupDx!, dy: m._groupDy! })),
      })
    } else {
      const minX = Math.min(...members.map((m) => m.x))
      const minY = Math.min(...members.map((m) => m.y))
      const maxX = Math.max(...members.map((m) => m.x + m.width))
      const maxY = Math.max(...members.map((m) => m.y + m.height))
      entities.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        groupIdx,
        members: members.map((m) => ({ box: m, dx: m.x - minX, dy: m.y - minY })),
      })
    }
  }

  for (const box of standalone) {
    entities.push({
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      members: [{ box, dx: 0, dy: 0 }],
    })
  }

  return entities
}

// Build a map from box.index → LayoutEntity for fast lookup.
export function buildBoxEntityIndex(entities: LayoutEntity[]): Map<number, LayoutEntity> {
  const m = new Map<number, LayoutEntity>()
  for (const e of entities) {
    for (const { box } of e.members) {
      m.set(box.index, e)
    }
  }
  return m
}

export function fillDepths(layouts: Box[], lines: Line[] | undefined): void {
  lines ??= []
  // Create quick lookup: id → Box
  const boxMap = new Map<BoxId, Box>()
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

  // Fill parents and children arrays with actual Box references
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

function entitiesOverlap(a: LayoutEntity, b: LayoutEntity): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

// True when the required gap between a and b is not satisfied (counts actual overlap too).
function gapViolated(a: LayoutEntity, b: LayoutEntity, minDistX: number, minDistY: number): boolean {
  return a.x < b.x + b.width + minDistX && b.x < a.x + a.width + minDistX && a.y < b.y + b.height + minDistY && b.y < a.y + a.height + minDistY
}

function layoutShrinkEntities(entities: LayoutEntity[], stepY: number): void {
  const rows = new Map<number, LayoutEntity[]>()
  for (const e of entities) {
    if (!rows.has(e.y)) rows.set(e.y, [])
    rows.get(e.y)!.push(e)
  }
  let y = 0
  for (const [, rowEntities] of [...rows.entries()].sort(([a], [b]) => a - b)) {
    for (const e of rowEntities) moveEntityTo(e, e.x, y)
    y += stepY
  }
}

export function fixOverlaps(layouts: Box[], cfg: Required<Config>, maxIter = 2): Box[] {
  const fixed = layouts.map((l) => ({ ...l }))
  const entities = toEntities(fixed)

  // Initial grid snap (entity top-left)
  for (const e of entities) {
    moveEntityTo(e, Math.round(e.x / cfg.gridX) * cfg.gridX, Math.round(e.y / cfg.gridY) * cfg.gridY)
  }

  let changed = true
  let iterations = 0

  while (changed && iterations < maxIter) {
    changed = false
    iterations++

    entities.sort((a, b) => a.y - b.y || a.x - b.x)

    for (let i = 0; i < entities.length; i++) {
      for (let j = 0; j < i; j++) {
        const curr = entities[i]
        const prev = entities[j]

        if (entitiesOverlap(curr, prev)) {
          const overlapX = Math.max(0, Math.min(curr.x + curr.width, prev.x + prev.width) - Math.max(curr.x, prev.x))
          const overlapY = Math.max(0, Math.min(curr.y + curr.height, prev.y + prev.height) - Math.max(curr.y, prev.y))

          if (overlapX <= overlapY || overlapY === 0) {
            moveEntityTo(curr, prev.x + prev.width + cfg.minDistX, curr.y)
          } else {
            moveEntityTo(curr, curr.x, prev.y + prev.height + cfg.minDistY)
          }
          changed = true
        }
      }
    }
  }

  // Final grid snap
  for (const e of entities) {
    moveEntityTo(e, Math.round(e.x / cfg.gridX) * cfg.gridX, Math.round(e.y / cfg.gridY) * cfg.gridY)
  }

  // Post-snap gap-repair: Math.round on x can shrink a gap below minDistX.
  // One more sorted pass re-establishes the invariant, ceil-snapping any push so boxes stay on grid.
  entities.sort((a, b) => a.y - b.y || a.x - b.x)
  for (let i = 0; i < entities.length; i++) {
    for (let j = 0; j < i; j++) {
      const curr = entities[i]
      const prev = entities[j]
      if (gapViolated(curr, prev, cfg.minDistX, cfg.minDistY)) {
        const overlapX = Math.min(curr.x + curr.width, prev.x + prev.width) - Math.max(curr.x, prev.x)
        const overlapY = Math.min(curr.y + curr.height, prev.y + prev.height) - Math.max(curr.y, prev.y)
        if (overlapX <= overlapY || overlapY === 0) {
          moveEntityTo(curr, Math.ceil((prev.x + prev.width + cfg.minDistX) / cfg.gridX) * cfg.gridX, curr.y)
        } else {
          moveEntityTo(curr, curr.x, Math.ceil((prev.y + prev.height + cfg.minDistY) / cfg.gridY) * cfg.gridY)
        }
      }
    }
  }

  if (cfg.shrinkRows) layoutShrinkEntities(entities, cfg.gridY)

  return fixed
}

export function snapToGridNoOverlaps(layouts: Box[], cfg: Required<Config>): Box[] {
  const fixed = layouts.map((l) => ({ ...l }))
  const entities = toEntities(fixed)

  // Single pass: top-left → bottom-right.
  // When curr needs to move (snap or conflict), apply delta to curr and everything
  // in its bottom-right quadrant (e.x >= curr.x AND e.y >= curr.y).
  // x and y are handled independently so a y-only snap doesn't cause an x-shift.
  entities.sort((a, b) => a.y - b.y || a.x - b.x)

  for (let i = 0; i < entities.length; i++) {
    const curr = entities[i]

    // Snap x to grid independently
    const snappedX = Math.ceil(curr.x / cfg.gridX) * cfg.gridX
    if (snappedX !== curr.x) {
      const dx = snappedX - curr.x
      for (const e of entities) {
        if (e.x >= curr.x || e.y >= curr.y) moveEntityTo(e, e.x + dx, e.y)
      }
    }

    // Snap y to grid independently
    const snappedY = Math.ceil(curr.y / cfg.gridY) * cfg.gridY
    if (snappedY !== curr.y) {
      const dy = snappedY - curr.y
      for (const e of entities) {
        if (e.x >= curr.x || e.y >= curr.y) moveEntityTo(e, e.x, e.y + dy)
      }
    }

    // Resolve conflicts with already-placed entities
    for (let j = 0; j < i; j++) {
      const prev = entities[j]
      if (!gapViolated(curr, prev, cfg.minDistX, cfg.minDistY)) continue

      const neededX = prev.x + prev.width + cfg.minDistX
      const neededY = prev.y + prev.height + cfg.minDistY
      const moveX = neededX - curr.x
      const moveY = neededY - curr.y

      if (moveX > 0 && (moveX <= moveY || moveY <= 0)) {
        const dx = Math.ceil(neededX / cfg.gridX) * cfg.gridX - curr.x
        for (const e of entities) {
          if (e.x >= curr.x || e.y >= curr.y) moveEntityTo(e, e.x + dx, e.y)
        }
      } else if (moveY > 0) {
        const dy = Math.ceil(neededY / cfg.gridY) * cfg.gridY - curr.y
        for (const e of entities) {
          if (e.x >= curr.x || e.y >= curr.y) moveEntityTo(e, e.x, e.y + dy)
        }
      }
    }
  }

  if (cfg.shrinkRows) layoutShrinkEntities(entities, cfg.gridY)

  return fixed
}

export function createInitialLayouts(patcher: Patcher): Box[] {
  return patcher.boxes.map((b: PatcherBox, index) => {
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

export function simpleFlow(baseLayouts: Box[], cfg: Required<Config>) {
  const cols: Record<string, Box[]> = {}

  for (const l of baseLayouts) {
    l.y = l.depth! * cfg.gridY
    cols[l.depth!] = cols[l.depth!] || []
    const last = cols[l.depth!].at(-1) ?? { x: -cfg.gridX, width: 0 }
    l.x = last.x + last.width + cfg.gridX
    cols[l.depth!].push(l)
  }
}

export function zeroFlow(layouts: Box[]) {
  for (const b of layouts) {
    b.x = 0
    b.y = 0
  }
}

export function squareFlow(layouts: Box[], cfg: Required<Config>) {
  const side = Math.ceil(Math.sqrt(layouts.length))
  layouts.forEach((b, i) => {
    b.x = (i % side) * cfg.gridX
    b.y = Math.floor(i / side) * cfg.gridY
  })
}

export function circleFlow(layouts: Box[], cfg: Required<Config>) {
  const diagonal = Math.sqrt(cfg.gridX * cfg.gridX + cfg.gridY * cfg.gridY)
  const circumference = layouts.length * diagonal
  const radius = circumference / (2 * Math.PI)
  layouts.forEach((b, i) => {
    const angle = (2 * Math.PI * i) / layouts.length
    const rawX = radius + radius * Math.cos(angle)
    const rawY = radius + radius * Math.sin(angle)
    b.x = Math.round(rawX / cfg.gridX) * cfg.gridX
    b.y = Math.round(rawY / cfg.gridY) * cfg.gridY
  })
}

export async function elkFlow(layouts: Box[], lines: Line[], rankdir: 'DOWN' | 'RIGHT' = 'DOWN', workerFactory?: (url: string) => unknown) {
  if (!workerFactory) throw new Error('elkFlow: workerFactory is required — provide one appropriate for your environment')
  const elk = new ELKCtor({ workerFactory, workerUrl: '' })

  const inletSide = rankdir === 'RIGHT' ? 'WEST' : 'NORTH'
  const outletSide = rankdir === 'RIGHT' ? 'EAST' : 'SOUTH'

  const elkNodes: ElkNode[] = layouts.map((b) => ({
    id: b.id,
    width: b.width,
    height: b.height,
    ports: [
      ...Array.from({ length: b.numInlets }, (_, i) => ({
        id: `${b.id}_in_${i}`,
        layoutOptions: { 'port.side': inletSide, 'port.index': String(i) },
      })),
      ...Array.from({ length: b.numOutlets }, (_, i) => ({
        id: `${b.id}_out_${i}`,
        layoutOptions: { 'port.side': outletSide, 'port.index': String(i) },
      })),
    ],
  }))

  const elkEdges = lines.map((l, i) => ({
    id: `e${i}`,
    sources: [`${l.patchline.source[0]}_out_${l.patchline.source[1]}`],
    targets: [`${l.patchline.destination[0]}_in_${l.patchline.destination[1]}`],
  }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': rankdir,
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.portConstraints': 'FIXED_SIDE',
    },
    children: elkNodes,
    edges: elkEdges,
  }

  const result = await elk.layout(graph)

  const posById = new Map((result.children ?? []).map((n: ElkNode) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]))
  for (const b of layouts) {
    const pos = posById.get(b.id)
    if (pos) {
      b.x = Math.round(pos.x)
      b.y = Math.round(pos.y)
    }
  }
}

export function dagreFlow(layouts: Box[], lines: Line[], rankdir: 'TB' | 'LR' | 'BT' | 'RL' = 'TB') {
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
