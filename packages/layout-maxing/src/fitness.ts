import { type Config, defaultConfig } from './config.ts'
import { type Box, type Line } from './layout.ts'
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
  singleSelfCollisions: number
  misalignedSS: number
  misalignedFirst: number
  area: number
  minDist: number
  view: number
  sharedFitness?: number
}

// Tuple: [label, shortcut, description]
export type FitnessMetaEntry = [label: string, shortcut: string, description: string]

export type FitnessMeta = Record<keyof Fitness, FitnessMetaEntry>

export const fitnessMeta: FitnessMeta = {
  score: ['Score', 'SCO', 'Overall composite fitness score (lower is better)'],
  crossings: ['Crossings', 'CRO', 'Number of line-line crossings'],
  length: ['Length', 'LEN', 'Total line length'],
  overlaps: ['Overlaps', 'OVE', 'Number of line-line overlaps'],
  collisions: ['Collisions', 'COL', 'Number of line-box collisions'],
  singleSelfCollisions: [
    'Single Self Collisions',
    'SSC',
    'Box-line collisions from single-outlet single-connection boxes with themselves',
  ],
  misalignedSS: [
    'Misaligned SS',
    'MSS',
    'Misaligned SSC sibling sources sharing a common child without shared x or y',
  ],
  misalignedFirst: [
    'Misaligned First',
    'MST',
    'Number of first-outlet to first-inlet lines with x-misalignment penalty applied',
  ],
  area: ['Area', 'ARE', 'Number of box-box intersection areas'],
  minDist: ['Min Dist', 'DST', 'Number of box pairs violating minDistX or minDistY spacing'],
  view: ['View', 'VIE', 'Viewport size'],
}

export function fitness(layouts: Box[], lines: Line[] | undefined, cfg?: Config): Fitness {
  lines ??= []
  const c = { ...defaultConfig, ...cfg }
  const boxMap = new Map<BoxId, Box>()
  for (const b of layouts) boxMap.set(b.id, b)

  let totalLength = 0
  let totalRawLength = 0
  let crossings = 0
  let overlaps = 0
  let collisions = 0
  let singleSelfCollisions = 0

  // Precompute SSC source boxes: numOutlets === 1, exactly 1 outgoing line, no incoming lines
  const outgoingCount = new Map<BoxId, number>()
  const incomingCount = new Map<BoxId, number>()
  for (const l of lines) {
    const src = l.patchline.source[0]
    const dst = l.patchline.destination[0]
    outgoingCount.set(src, (outgoingCount.get(src) ?? 0) + 1)
    incomingCount.set(dst, (incomingCount.get(dst) ?? 0) + 1)
  }
  const sscSourceIds = new Set<BoxId>()
  for (const b of layouts) {
    if (b.numOutlets === 1 && outgoingCount.get(b.id) === 1 && !incomingCount.has(b.id))
      sscSourceIds.add(b.id)
  }

  // Compute misalignedSS: SSC sibling pairs sharing a child without shared x or y
  const sscByChild = new Map<BoxId, Box[]>()
  for (const l of lines) {
    const srcId = l.patchline.source[0]
    if (!sscSourceIds.has(srcId)) continue
    const dstId = l.patchline.destination[0]
    if (!sscByChild.has(dstId)) sscByChild.set(dstId, [])
    sscByChild.get(dstId)!.push(boxMap.get(srcId)!)
  }

  let misalignedSS = 0
  let misalignedFirst = 0
  for (const siblings of sscByChild.values()) {
    if (siblings.length < 2) continue
    const cols = Math.round(siblings.length * 0.25)
    for (const a of siblings) {
      const hasAligned = siblings.filter((b) => b !== a && b.x === a.x).length > cols
      if (!hasAligned) misalignedSS++
    }
  }

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

    const sourceBoxId = l1.patchline.source[0]
    for (const box of layouts) {
      if (boxLineCollision(box, pts1, c.boxZone)) {
        if (sscSourceIds.has(sourceBoxId) && box.id === sourceBoxId) {
          singleSelfCollisions++
        } else {
          collisions++
        }
      }
    }

    const segmentLength = bezierLength(pts1.sx, pts1.sy, c1x, c1y, c2x, c2y, pts1.ex, pts1.ey)
    totalRawLength += segmentLength

    let firstMisalignmentPenalty = 0
    if (l1.patchline.source[1] === 0 && l1.patchline.destination[1] === 0 && pts1.sx !== pts1.ex) {
      misalignedFirst++
      firstMisalignmentPenalty = Math.abs(pts1.sx - pts1.ex) * c.misalignedFirstPenalty
    }

    totalLength +=
      (segmentLength + firstMisalignmentPenalty) *
      (cross_pen ? cross_pen * c.crossPenalty : 1) *
      (over_pen ? over_pen * c.overPenalty : 1) *
      reverse_pen
  }

  let area = 0
  let minDist = 0

  for (let i = 0; i < layouts.length; i++) {
    for (let j = i + 1; j < layouts.length; j++) {
      const a = layouts[i]
      const b = layouts[j]

      const sameGroup = a.groupIdx !== undefined && a.groupIdx === b.groupIdx

      if (!sameGroup && getIntersectionArea(a, b, c.minDistX / 2)) area++

      if (sameGroup) continue

      const xGap = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width))
      const yGap = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height))
      if (xGap < c.minDistX && yGap < c.minDistY) minDist++
    }
  }

  const vp = getViewPort(layouts)
  const view = vp[2] * vp[3]
  let ar = Math.max(vp[2] / vp[3], vp[3] / vp[2])
  ar = ar > c.arMax ? ar : 0

  // Apply crossing penalty
  return {
    score:
      (totalLength || 1) *
      view ** (1 / layouts.length) *
      c.totalCollisionPenalty ** collisions *
      c.totalSSCPenalty ** singleSelfCollisions *
      c.misalignedSSPenalty ** misalignedSS *
      c.totalCrossPenalty ** crossings *
      c.totalOverPenalty ** overlaps *
      c.areaPenalty ** area *
      c.totalDistPenalty ** minDist *
      c.arPenalty ** ar,
    crossings,
    overlaps,
    collisions,
    singleSelfCollisions,
    misalignedSS,
    misalignedFirst,
    area,
    minDist,
    view,
    length: totalRawLength,
  }
}
