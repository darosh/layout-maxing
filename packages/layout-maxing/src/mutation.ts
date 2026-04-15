import { type Config } from './config.ts'
import { type Box, type LayoutEntity, toEntities, moveEntityTo, swapEntities, buildBoxEntityIndex } from './layout.ts'

export function cloneLayouts(layouts: Box[]): Box[] {
  return layouts.map((l) => ({ ...l }))
}

export function mutateSingle(target: LayoutEntity, delta: { x: number; y: number }): void {
  moveEntityTo(target, target.x + delta.x, target.y + delta.y)
}

export function mutateWithChildren(
  target: LayoutEntity,
  entities: LayoutEntity[],
  delta: { x: number; y: number },
  maxDepth: number,
  boxEntityMap?: Map<number, LayoutEntity>,
): void {
  const entityMap = boxEntityMap ?? buildBoxEntityIndex(entities)
  const visited = new Set<LayoutEntity>()

  function apply(entity: LayoutEntity, depth: number) {
    if (depth <= 0 || visited.has(entity)) return
    visited.add(entity)
    moveEntityTo(entity, entity.x + delta.x, entity.y + delta.y)
    for (const { box } of entity.members) {
      for (const childIdx of box.children ?? []) {
        const childEntity = entityMap.get(childIdx)
        if (childEntity) apply(childEntity, depth - 1)
      }
    }
  }

  apply(target, maxDepth + 1)
}

export function mutateWithParents(
  target: LayoutEntity,
  entities: LayoutEntity[],
  delta: { x: number; y: number },
  maxDepth: number,
  boxEntityMap?: Map<number, LayoutEntity>,
): void {
  const entityMap = boxEntityMap ?? buildBoxEntityIndex(entities)
  const visited = new Set<LayoutEntity>()

  function apply(entity: LayoutEntity, depth: number) {
    if (depth <= 0 || visited.has(entity)) return
    visited.add(entity)
    moveEntityTo(entity, entity.x + delta.x, entity.y + delta.y)
    for (const { box } of entity.members) {
      for (const parentIdx of box.parents ?? []) {
        const parentEntity = entityMap.get(parentIdx)
        if (parentEntity) apply(parentEntity, depth - 1)
      }
    }
  }

  apply(target, maxDepth + 1)
}

export function mutateByQuadrant(target: LayoutEntity, entities: LayoutEntity[], delta: { x: number; y: number }, quadrant: number): void {
  const left = quadrant === 0 || quadrant === 2
  const top = quadrant === 0 || quadrant === 1

  for (const e of entities) {
    const inX = left ? e.x <= target.x : e.x >= target.x
    const inY = top ? e.y <= target.y : e.y >= target.y
    if (inX && inY) moveEntityTo(e, e.x + delta.x, e.y + delta.y)
  }
}

export function mutateSwapRandom(target: LayoutEntity, entities: LayoutEntity[], rand: () => number): void {
  const idx = Math.floor(rand() * entities.length) % entities.length
  const other = entities[idx]
  if (other !== target) swapEntities(target, other)
}

export function mutateSwapSibling(target: LayoutEntity, entities: LayoutEntity[], rand: () => number, boxEntityMap?: Map<number, LayoutEntity>): void {
  const entityMap = boxEntityMap ?? buildBoxEntityIndex(entities)
  const siblingEntities = new Set<LayoutEntity>()

  for (const { box } of target.members) {
    for (const parentIdx of box.parents ?? []) {
      const parentEntity = entityMap.get(parentIdx)
      if (!parentEntity) continue
      for (const { box: parentBox } of parentEntity.members) {
        for (const childIdx of parentBox.children ?? []) {
          const sibEntity = entityMap.get(childIdx)
          if (sibEntity && sibEntity !== target) siblingEntities.add(sibEntity)
        }
      }
    }
  }

  const siblings = [...siblingEntities]
  if (siblings.length === 0) return
  const sibling = siblings[Math.floor(rand() * siblings.length) % siblings.length]
  swapEntities(target, sibling)
}

export function mutateSwapInRow(target: LayoutEntity, entities: LayoutEntity[], rand: () => number, cfg: Required<Config>): void {
  const row = entities.filter((e) => e.y === target.y).sort((a, b) => a.x - b.x)
  const idx = row.findIndex((e) => e === target)
  const neighbors: LayoutEntity[] = []
  if (idx > 0) neighbors.push(row[idx - 1])
  if (idx < row.length - 1) neighbors.push(row[idx + 1])
  if (neighbors.length === 0) return

  const other = neighbors[Math.floor(rand() * neighbors.length) % neighbors.length]
  const [left, right] = target.x < other.x ? [target, other] : [other, target]
  const leftX = left.x
  const rightX = right.x
  moveEntityTo(right, leftX, right.y)
  moveEntityTo(left, Math.round((rightX + right.width - left.width) / cfg.gridX) * cfg.gridX, left.y)
}

export function mutateSwapInCol(target: LayoutEntity, entities: LayoutEntity[], rand: () => number, cfg: Required<Config>): void {
  const col = entities.filter((e) => e.x === target.x).sort((a, b) => a.y - b.y)
  const idx = col.findIndex((e) => e === target)
  const neighbors: LayoutEntity[] = []
  if (idx > 0) neighbors.push(col[idx - 1])
  if (idx < col.length - 1) neighbors.push(col[idx + 1])
  if (neighbors.length === 0) return

  const other = neighbors[Math.floor(rand() * neighbors.length) % neighbors.length]
  const [top, bottom] = target.y < other.y ? [target, other] : [other, target]
  const topY = top.y
  const bottomY = bottom.y
  moveEntityTo(bottom, bottom.x, topY)
  moveEntityTo(top, top.x, Math.round((bottomY + bottom.height - top.height) / cfg.gridY) * cfg.gridY)
}

export function mutateShiftRow(target: LayoutEntity, entities: LayoutEntity[], delta: { x: number }): void {
  for (const e of entities.filter((e) => e.y === target.y)) {
    moveEntityTo(e, e.x + delta.x, e.y)
  }
}

export function mutateShiftCol(target: LayoutEntity, entities: LayoutEntity[], delta: { y: number }): void {
  for (const e of entities.filter((e) => e.x === target.x)) {
    moveEntityTo(e, e.x, e.y + delta.y)
  }
}

// Find entity in otherEntities that matches the given entity (by groupIdx or box.index).
function matchEntity(entity: LayoutEntity, otherEntities: LayoutEntity[]): LayoutEntity | undefined {
  if (entity.groupIdx !== undefined) {
    return otherEntities.find((e) => e.groupIdx === entity.groupIdx)
  }
  const myIdx = entity.members[0].box.index
  return otherEntities.find((e) => e.groupIdx === undefined && e.members[0].box.index === myIdx)
}

export function crossover(parent1: Box[], parent2: Box[], rand: () => number, cfg: Required<Config>): Box[] {
  const child = cloneLayouts(parent1)
  const childEntities = toEntities(child)
  const p2Entities = toEntities(parent2)

  for (const e of childEntities) {
    if (rand() < cfg.crossoverMix) {
      const p2e = matchEntity(e, p2Entities)
      if (!p2e) continue
      moveEntityTo(e, p2e.x, p2e.y)

      // Merge mutation histories per member
      for (const { box: childBox } of e.members) {
        const p2Box = p2e.members.find((m) => m.box.index === childBox.index)?.box
        if (!p2Box) continue
        const merged: Record<string, number> = { ...p2Box._mutations }
        for (const [k, v] of Object.entries(childBox._mutations ?? {})) {
          merged[k] = (merged[k] ?? 0) + v
        }
        merged['crossover'] = (merged['crossover'] ?? 0) + 1
        childBox._mutations = merged
      }
    }
  }

  return child
}

export function crossoverStructural(parent1: Box[], parent2: Box[], rand: () => number): Box[] {
  const child = cloneLayouts(parent1)
  const childEntities = toEntities(child)
  const p2Entities = toEntities(parent2)

  // Pick random entity as structural transplant root
  const targetEntityIdx = Math.floor(rand() * childEntities.length)
  const targetEntity = childEntities[targetEntityIdx]

  const boxEntityMap = buildBoxEntityIndex(childEntities)

  // BFS: collect target entity + all descendant entities
  const toTransplant = new Set<LayoutEntity>()
  const queue = [targetEntity]

  while (queue.length > 0) {
    const entity = queue.shift()!
    if (toTransplant.has(entity)) continue
    toTransplant.add(entity)
    for (const { box } of entity.members) {
      for (const childIdx of box.children ?? []) {
        const childEntity = boxEntityMap.get(childIdx)
        if (childEntity && !toTransplant.has(childEntity)) queue.push(childEntity)
      }
    }
  }

  // Copy positions from parent2 for all transplanted entities
  for (const entity of toTransplant) {
    const p2e = matchEntity(entity, p2Entities)
    if (!p2e) continue
    moveEntityTo(entity, p2e.x, p2e.y)

    for (const { box: childBox } of entity.members) {
      const p2Box = p2e.members.find((m) => m.box.index === childBox.index)?.box
      if (!p2Box) continue
      const merged: Record<string, number> = { ...p2Box._mutations }
      for (const [k, v] of Object.entries(childBox._mutations ?? {})) {
        merged[k] = (merged[k] ?? 0) + v
      }
      merged['crossoverStructural'] = (merged['crossoverStructural'] ?? 0) + 1
      childBox._mutations = merged
    }
  }

  return child
}
