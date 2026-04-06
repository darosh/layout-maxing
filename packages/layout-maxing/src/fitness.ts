import { type Config, defaultConfig } from './config.ts'
import { type BoxLayout, type Line } from './layout.ts'
import {
  segmentsIntersect,
  segmentsOverlap,
  bezierLength,
  getViewPort,
  getStraightLinePoints,
  boxLineCollision,
  getIntersectionArea,
} from './geometry.ts'

type BoxId = string

export interface Fitness {
  score: number
  crossings: number
  length: number
  overlaps: number
  collisions: number
  area: number
  view: number
}

// Tuple: [label, shortcut, description]
export type FitnessMetaEntry = [
  label: string,
  shortcut: string,
  description: string,
]

export type FitnessMeta = Record<keyof Fitness, FitnessMetaEntry>

export const fitnessMeta: FitnessMeta = {
  score:      ['Score',      'SCO', 'Overall composite fitness score (lower is better)'],
  crossings:  ['Crossings',  'CRO', 'Number of line-line crossings'],
  length:     ['Length',     'LEN', 'Total line length'],
  overlaps:   ['Overlaps',   'OVE', 'Number of line-line overlaps'],
  collisions: ['Collisions', 'COL', 'Number of line-box collisions'],
  area:       ['Area',       'ARE', 'Number of box-box intersection areas'],
  view:       ['View',       'VIE', 'Viewport size'],
}

export function fitness(layouts: BoxLayout[], lines: Line[], cfg?: Config): Fitness {
  const c = { ...defaultConfig, ...cfg }
  const boxMap = new Map<BoxId, BoxLayout>()
  for (const b of layouts) boxMap.set(b.id, b)

  let totalLength = 0
  let totalRawLength = 0
  let crossings = 0
  let overlaps = 0
  let collisions = 0

  for (let i = 0; i < lines.length; i++) {
    const l1 = lines[i]
    const pts1 = getStraightLinePoints(l1, boxMap, c)

    // Bezier length (exact curve)
    const c1x = pts1.sx
    const c1y = pts1.sy + c.curveControl
    const c2x = pts1.ex
    const c2y = pts1.ey - c.curveControl

    let cross_pen = 0
    let over_pen = 0
    const reverse_pen = pts1.ey > pts1.sy ? 1 : c.reversePenalty

    // Crossing detection (straight-line approximation for speed)
    for (let j = i + 1; j < lines.length; j++) {
      const l2 = lines[j]
      const pts2 = getStraightLinePoints(l2, boxMap, c)

      if (segmentsOverlap(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)) {
        overlaps++
        over_pen++
      } else if (
        segmentsIntersect(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)
      ) {
        crossings++
        cross_pen++
      }
    }

    for (const box of layouts) {
      collisions += boxLineCollision(box, pts1, c.boxZone) ? 1 : 0
    }

    const segmentLength = bezierLength(pts1.sx, pts1.sy, c1x, c1y, c2x, c2y, pts1.ex, pts1.ey)
    totalRawLength += segmentLength
    totalLength +=
      segmentLength *
      (cross_pen ? cross_pen * c.crossPenalty : 1) *
      (over_pen ? over_pen * c.overPenalty : 1) *
      reverse_pen
  }

  let area = 0

  for (let i = 0; i < layouts.length; i++) {
    for (let j = i + 1; j < layouts.length; j++) {
      area += getIntersectionArea(layouts[i], layouts[j], c.minDistX / 2) ? 1 : 0
    }
  }

  const vp = getViewPort(layouts)
  const view = vp[2] * vp[3]

  // Apply crossing penalty
  return {
    score:
      totalLength *
      view ** (1 / layouts.length) *
      c.totalCollisionPenalty ** collisions *
      c.totalCrossPenalty ** crossings *
      c.totalOverPenalty ** overlaps *
      c.areaPenalty ** area,
    crossings,
    overlaps,
    collisions,
    area,
    view,
    length: totalRawLength,
  }
}
