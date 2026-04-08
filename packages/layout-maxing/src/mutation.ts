import { type Config } from './config.ts'
import { type BoxLayout } from './layout.ts'

export function cloneLayouts(layouts: BoxLayout[]): BoxLayout[] {
  return layouts.map((l) => ({ ...l }))
}

export function hasSiblings(box: BoxLayout, layouts: BoxLayout[]): boolean {
  if (!box.parents || box.parents.length === 0) return false

  const byIndex = new Map(layouts.map((l) => [l.index, l]))
  return box.parents.some((parentIndex) => {
    const parent = byIndex.get(parentIndex)
    return parent?.children?.some((childIndex) => childIndex !== box.index)
  })
}

export function getRandomSibling(
  box: BoxLayout,
  layouts: BoxLayout[],
  rand: () => number = Math.random,
): number | undefined {
  if (!box.parents || box.parents.length === 0) return undefined

  const byIndex = new Map(layouts.map((l) => [l.index, l]))
  const siblings: number[] = []

  for (const parentIndex of box.parents) {
    const parent = byIndex.get(parentIndex)
    for (const childIndex of parent?.children ?? []) {
      if (childIndex !== box.index) siblings.push(childIndex)
    }
  }

  if (siblings.length === 0) return undefined

  return siblings[Math.floor(rand() * siblings.length)]
}

export function mutateSingle(
  target: BoxLayout,
  layouts: BoxLayout[],
  delta: { x: number; y: number },
): BoxLayout[] {
  target.x += delta.x
  target.y += delta.y
  return layouts
}

export function mutateWithChildren(
  target: BoxLayout,
  layouts: BoxLayout[],
  delta: { x: number; y: number },
  maxDepth: number,
): BoxLayout[] {
  const byIndex = new Map(layouts.map((l) => [l.index, l]))
  const visited = new Set<number>()

  function apply(box: BoxLayout, depth: number) {
    if (depth <= 0 || visited.has(box.index)) return
    visited.add(box.index)
    box.x += delta.x
    box.y += delta.y
    for (const index of box.children ?? []) {
      apply(byIndex.get(index)!, depth - 1)
    }
  }

  apply(target, maxDepth + 1)
  return layouts
}

export function mutateWithParents(
  target: BoxLayout,
  layouts: BoxLayout[],
  delta: { x: number; y: number },
  maxDepth: number,
): BoxLayout[] {
  const byIndex = new Map(layouts.map((l) => [l.index, l]))
  const visited = new Set<number>()

  function apply(box: BoxLayout, depth: number) {
    if (depth <= 0 || visited.has(box.index)) return
    visited.add(box.index)
    box.x += delta.x
    box.y += delta.y
    for (const index of box.parents ?? []) {
      apply(byIndex.get(index)!, depth - 1)
    }
  }

  apply(target, maxDepth + 1)
  return layouts
}

export function mutateByQuadrant(
  target: BoxLayout,
  layouts: BoxLayout[],
  delta: { x: number; y: number },
  quadrant: number,
): BoxLayout[] {
  const left = quadrant === 0 || quadrant === 2
  const top = quadrant === 0 || quadrant === 1

  for (const box of layouts) {
    const inX = left ? box.x <= target.x : box.x >= target.x
    const inY = top ? box.y <= target.y : box.y >= target.y
    if (inX && inY) {
      box.x += delta.x
      box.y += delta.y
    }
  }

  return layouts
}

export function swap(box: BoxLayout, src: BoxLayout) {
  const x = box.x
  const y = box.y
  box.x = src.x
  box.y = src.y
  src.x = x
  src.y = y
}

export function mutateSwapRandom(target: BoxLayout, layouts: BoxLayout[], rand) {
  const ind = Math.floor(rand() * layouts.length) % layouts.length
  const src = layouts[ind]
  swap(target, src)
  return layouts
}

export function mutateSwapSibling(target: BoxLayout, layouts: BoxLayout[], rand) {
  if (!hasSiblings(target, layouts)) return layouts

  const is = getRandomSibling(target, layouts, rand)!
  const src = layouts.find((v) => v.index === is)!
  swap(target, src)
  return layouts
}

export function getRow(box: BoxLayout, layouts: BoxLayout[]): BoxLayout[] {
  return layouts.filter((l) => l.y === box.y).sort((a, b) => a.x - b.x)
}

export function getCol(box: BoxLayout, layouts: BoxLayout[]): BoxLayout[] {
  return layouts.filter((l) => l.x === box.x).sort((a, b) => a.y - b.y)
}

export function mutateSwapInRow(
  target: BoxLayout,
  layouts: BoxLayout[],
  rand: () => number,
  cfg: Required<Config>,
): BoxLayout[] {
  const row = getRow(target, layouts)
  const idx = row.findIndex((b) => b.index === target.index)
  const neighbors: BoxLayout[] = []
  if (idx > 0) neighbors.push(row[idx - 1])
  if (idx < row.length - 1) neighbors.push(row[idx + 1])
  if (neighbors.length === 0) return layouts

  const other = neighbors[Math.floor(rand() * neighbors.length) % neighbors.length]
  const [left, right] = target.x < other.x ? [target, other] : [other, target]
  const leftX = left.x
  const rightX = right.x
  right.x = leftX
  left.x = Math.round((rightX + right.width - left.width) / cfg.gridX) * cfg.gridX
  return layouts
}

export function mutateSwapInCol(
  target: BoxLayout,
  layouts: BoxLayout[],
  rand: () => number,
  cfg: Required<Config>,
): BoxLayout[] {
  const col = getCol(target, layouts)
  const idx = col.findIndex((b) => b.index === target.index)
  const neighbors: BoxLayout[] = []
  if (idx > 0) neighbors.push(col[idx - 1])
  if (idx < col.length - 1) neighbors.push(col[idx + 1])
  if (neighbors.length === 0) return layouts

  const other = neighbors[Math.floor(rand() * neighbors.length) % neighbors.length]
  const [top, bottom] = target.y < other.y ? [target, other] : [other, target]
  const topY = top.y
  const bottomY = bottom.y
  bottom.y = topY
  top.y = Math.round((bottomY + bottom.height - top.height) / cfg.gridY) * cfg.gridY
  return layouts
}

export function crossover(
  parent1: BoxLayout[],
  parent2: BoxLayout[],
  rand: () => number,
  cfg: Required<Config>,
): BoxLayout[] {
  const child = cloneLayouts(parent1)
  for (let i = 0; i < child.length; i++) {
    if (rand() < cfg.crossoverMix) {
      child[i].x = parent2[i].x
      child[i].y = parent2[i].y
    }
  }
  // return fixOverlaps(child)
  return child
}
