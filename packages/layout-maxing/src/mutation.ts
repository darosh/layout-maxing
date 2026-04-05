import { type Config } from './config.ts'
import { type BoxLayout } from './layout.ts'

export function cloneLayouts(layouts: BoxLayout[]): BoxLayout[] {
  return layouts.map((l) => ({ ...l }))
}

export function hasSiblings(box: BoxLayout): boolean {
  if (!box.parents || box.parents.length === 0) return false

  return box.parents.some((parent) => {
    if (!parent.children) return false
    return parent.children.some((child) => child.id !== box.id)
  })
}

export function getRandomSibling(
  box: BoxLayout,
  rand: () => number = Math.random,
): number | undefined {
  if (!box.parents || box.parents.length === 0) return undefined

  const siblings: BoxLayout[] = []

  for (const parent of box.parents) {
    if (!parent.children) continue

    for (const child of parent.children) {
      if (child.id !== box.id) {
        siblings.push(child)
      }
    }
  }

  if (siblings.length === 0) return undefined

  const randomIndex = Math.floor(rand() * siblings.length)
  return siblings[randomIndex].index
}

export function mutate(
  layouts: BoxLayout[],
  mutationsRate: number,
  rand: () => number,
  cfg: Required<Config>,
): BoxLayout[] {
  const mutated = cloneLayouts(layouts)

  function mutateChildren(box: BoxLayout, x: number, y: number, max = 2) {
    if (max === 0) {
      return
    }

    for (const { index } of box.children ?? []) {
      const child = mutated.find((v) => v.index === index)!

      child.x += x
      child.y += y

      if (rand() < cfg.mutateChildren) {
        mutateChildren(child, x, y, max - 1)
      }
    }
  }

  function mutateParents(box: BoxLayout, x: number, y: number, max = 2) {
    if (max === 0) {
      return
    }

    for (const { index } of box.parents ?? []) {
      const parent = mutated.find((v) => v.index === index)!

      parent.x += x
      parent.y += y

      if (rand() < cfg.mutateParents) {
        mutateParents(parent, x, y, max - 1)
      }
    }
  }

  for (const box of mutated) {
    if (rand() < mutationsRate) {
      const mxy = rand()

      const x = mxy < 0.6 ? Math.round((rand() - 0.5) * cfg.mutate) * cfg.gridX : 0
      const y = mxy > 0.4 ? Math.round((rand() - 0.5) * cfg.mutate) * cfg.gridY : 0

      box.x += x
      box.y += y

      if (rand() < cfg.mutateChildren) {
        mutateChildren(box, x, y, Math.round(cfg.maxChildren * rand()))
      }

      if (rand() < cfg.mutateParents) {
        mutateParents(box, x, y, Math.round(cfg.maxParents * rand()))
      }
    }

    if (rand() < cfg.swapRate) {
      let ind

      if (rand() < cfg.siblingsSwapRate && hasSiblings(box)) {
        const is = getRandomSibling(box, rand)!
        ind = mutated.findIndex((v) => v.index === is)
      } else {
        ind = Math.floor(rand() * mutated.length) % mutated.length
      }

      const src = mutated[ind]
      const x = box.x
      const y = box.y
      box.x = src.x
      box.y = src.y
      src.x = x
      src.y = y
    }
  }

  // return fixOverlaps(mutated)
  return mutated
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
  const visited = new Set<number>()

  function apply(box: BoxLayout, depth: number) {
    if (depth <= 0 || visited.has(box.index)) return
    visited.add(box.index)
    box.x += delta.x
    box.y += delta.y
    for (const { index } of box.children ?? []) {
      const child = layouts.find((v) => v.index === index)!
      apply(child, depth - 1)
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
  const visited = new Set<number>()

  function apply(box: BoxLayout, depth: number) {
    if (depth <= 0 || visited.has(box.index)) return
    visited.add(box.index)
    box.x += delta.x
    box.y += delta.y
    for (const { index } of box.parents ?? []) {
      const parent = layouts.find((v) => v.index === index)!
      apply(parent, depth - 1)
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

export function mutateSwapRandom(target: BoxLayout,
                                 layouts: BoxLayout[], rand) {
  const ind = Math.floor(rand() * layouts.length) % layouts.length
  const src = layouts[ind]
  swap(target, src)
  return layouts
}

export function mutateSwapSibling(target: BoxLayout, layouts: BoxLayout[], rand) {
  if (!hasSiblings(target)) {
    return layouts
  }

  const is = getRandomSibling(target, rand)!
  const ind = layouts.findIndex((v) => v.index === is)
  const src = layouts[ind]
  swap(target, src)
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
