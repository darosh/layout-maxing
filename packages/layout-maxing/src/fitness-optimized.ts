import { type Config, defaultConfig } from './config.ts'
import { type Box, type Line } from './layout.ts'
import { segmentsIntersect, segmentsOverlap, bezierLength, getViewPort, getStraightLinePoints, boxLineCollision, getIntersectionArea } from './geometry.ts'
import { SpatialGrid } from './spatial-grid.ts'

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
  singleSelfCollisions: ['Single Self Collisions', 'SSC', 'Box-line collisions from single-outlet single-connection boxes with themselves'],
  misalignedSS: ['Misaligned SS', 'MSS', 'Misaligned SSC sibling sources sharing a common child without shared x or y'],
  misalignedFirst: ['Misaligned First', 'MST', 'Number of first-outlet to first-inlet lines with x-misalignment penalty applied'],
  area: ['Area', 'ARE', 'Number of box-box intersection areas'],
  minDist: ['Min Dist', 'DST', 'Number of box pairs violating minDistX or minDistY spacing'],
  view: ['View', 'VIE', 'Viewport size'],
  sharedFitness: ['Shared Fitness', 'SHF', 'Niching fitness-sharing-adjusted score'],
}

export interface Topology {
  sscSourceIds: Set<BoxId>
  sscByChildIds: Map<BoxId, BoxId[]>
}

export function precomputeTopology(lines: Line[], boxes: { id: string; numOutlets?: number }[]): Topology {
  const outgoingCount = new Map<BoxId, number>()
  const incomingCount = new Map<BoxId, number>()
  for (const l of lines) {
    const src = l.patchline.source[0]
    const dst = l.patchline.destination[0]
    outgoingCount.set(src, (outgoingCount.get(src) ?? 0) + 1)
    incomingCount.set(dst, (incomingCount.get(dst) ?? 0) + 1)
  }
  const sscSourceIds = new Set<BoxId>()
  for (const b of boxes) {
    if (b.numOutlets === 1 && outgoingCount.get(b.id) === 1 && !incomingCount.has(b.id)) sscSourceIds.add(b.id)
  }
  const sscByChildIds = new Map<BoxId, BoxId[]>()
  for (const l of lines) {
    const srcId = l.patchline.source[0]
    if (!sscSourceIds.has(srcId)) continue
    const dstId = l.patchline.destination[0]
    if (!sscByChildIds.has(dstId)) sscByChildIds.set(dstId, [])
    sscByChildIds.get(dstId)!.push(srcId)
  }
  return { sscSourceIds, sscByChildIds }
}

export function fitness(layouts: Box[], lines: Line[] | undefined, cfg?: Config, topology?: Topology): Fitness {
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

  let sscSourceIds: Set<BoxId>
  let sscByChildIds: Map<BoxId, BoxId[]>
  if (topology) {
    sscSourceIds = topology.sscSourceIds
    sscByChildIds = topology.sscByChildIds
  } else {
    const t = precomputeTopology(lines, layouts)
    sscSourceIds = t.sscSourceIds
    sscByChildIds = t.sscByChildIds
  }

  // Compute misalignedSS: SSC sibling pairs sharing a child without shared x or y
  const sscByChild = new Map<BoxId, Box[]>()
  for (const [dstId, srcIds] of sscByChildIds) {
    const boxes: Box[] = []
    for (const srcId of srcIds) {
      const b = boxMap.get(srcId)
      if (b) boxes.push(b)
    }
    if (boxes.length > 0) sscByChild.set(dstId, boxes)
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

  const linePoints = lines.map((line) => getStraightLinePoints(line, boxMap, c))

  let area = 0
  let minDist = 0

  if (layouts.length < 60) {
    // Brute-force O(n²): cheaper than grid overhead for small inputs
    for (let i = 0; i < lines.length; i++) {
      const l1 = lines[i]
      const pts1 = linePoints[i]
      const c1x = pts1.sx, c1y = pts1.sy + c.curveControl
      const c2x = pts1.ex, c2y = pts1.ey - c.curveControl
      let cross_pen = 0, over_pen = 0
      const reverse_pen = pts1.ey > pts1.sy ? 1 : c.reversePenalty
      for (let j = i + 1; j < lines.length; j++) {
        const pts2 = linePoints[j]
        if (segmentsOverlap(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)) { overlaps++; over_pen++ }
        else if (segmentsIntersect(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)) { crossings++; cross_pen++ }
      }
      const sourceBoxId = l1.patchline.source[0]
      const lx0 = Math.min(pts1.sx, pts1.ex) - c.boxZone
      const lx1 = Math.max(pts1.sx, pts1.ex) + c.boxZone
      const ly0 = Math.min(pts1.sy, pts1.ey)
      const ly1 = Math.max(pts1.sy, pts1.ey)
      for (const box of layouts) {
        if (box.x + box.width < lx0 || box.x > lx1 || box.y + box.height < ly0 || box.y > ly1) continue
        if (boxLineCollision(box, pts1, c.boxZone)) {
          if (sscSourceIds.has(sourceBoxId) && box.id === sourceBoxId) singleSelfCollisions++
          else collisions++
        }
      }
      const segmentLength = bezierLength(pts1.sx, pts1.sy, c1x, c1y, c2x, c2y, pts1.ex, pts1.ey)
      totalRawLength += segmentLength
      let firstMisalignmentPenalty = 0
      if (l1.patchline.source[1] === 0 && l1.patchline.destination[1] === 0 && pts1.sx !== pts1.ex) {
        misalignedFirst++
        firstMisalignmentPenalty = Math.abs(pts1.sx - pts1.ex) * c.misalignedFirstPenalty
      }
      totalLength += (segmentLength + firstMisalignmentPenalty) * (cross_pen ? cross_pen * c.crossPenalty : 1) * (over_pen ? over_pen * c.overPenalty : 1) * reverse_pen
    }
    for (let i = 0; i < layouts.length; i++) {
      for (let j = i + 1; j < layouts.length; j++) {
        const a = layouts[i], b = layouts[j]
        const sameGroup = a.groupIdx !== undefined && a.groupIdx === b.groupIdx
        if (!sameGroup && getIntersectionArea(a, b, c.minDistX / 2)) area++
        if (sameGroup) continue
        const xGap = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width))
        const yGap = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height))
        if (xGap < c.minDistX && yGap < c.minDistY) minDist++
      }
    }
  } else {
    // Spatial grid: O(n·k), worthwhile for larger inputs
    const avgBoxDim = layouts.reduce((s, b) => s + b.width + b.height, 0) / (2 * layouts.length)
    const cs = avgBoxDim * 2
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let boxSlots = 0
    for (const b of layouts) {
      if (b.x < minX) minX = b.x
      if (b.y < minY) minY = b.y
      if (b.x + b.width > maxX) maxX = b.x + b.width
      if (b.y + b.height > maxY) maxY = b.y + b.height
      boxSlots += (Math.floor((b.x + b.width) / cs) - Math.floor(b.x / cs) + 1) *
                  (Math.floor((b.y + b.height) / cs) - Math.floor(b.y / cs) + 1)
    }
    let lineSlots = 0
    for (const pts of linePoints) {
      lineSlots += (Math.floor(Math.max(pts.sx, pts.ex) / cs) - Math.floor(Math.min(pts.sx, pts.ex) / cs) + 1) *
                   (Math.floor(Math.max(pts.sy, pts.ey) / cs) - Math.floor(Math.min(pts.sy, pts.ey) / cs) + 1)
    }
    const grid = new SpatialGrid(cs, layouts.length, lines.length, minX, minY, maxX, maxY, boxSlots, lineSlots)
    for (let i = 0; i < layouts.length; i++) grid.insertBox(i, layouts[i])
    for (let i = 0; i < lines.length; i++) grid.insertLine(i, linePoints[i])
    const nearbyLines: number[] = []
    const nearbyBoxIdx: number[] = []

    for (let i = 0; i < lines.length; i++) {
      const l1 = lines[i]
      const pts1 = linePoints[i]
      const c1x = pts1.sx, c1y = pts1.sy + c.curveControl
      const c2x = pts1.ex, c2y = pts1.ey - c.curveControl
      let cross_pen = 0, over_pen = 0
      const reverse_pen = pts1.ey > pts1.sy ? 1 : c.reversePenalty
      grid.queryLineIndices(Math.min(pts1.sx, pts1.ex), Math.min(pts1.sy, pts1.ey), Math.abs(pts1.sx - pts1.ex), Math.abs(pts1.sy - pts1.ey), nearbyLines)
      for (let k = 0; k < nearbyLines.length; k++) {
        const j = nearbyLines[k]
        if (j <= i) continue
        const pts2 = linePoints[j]
        if (segmentsOverlap(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)) { overlaps++; over_pen++ }
        else if (segmentsIntersect(pts1.sx, pts1.sy, pts1.ex, pts1.ey, pts2.sx, pts2.sy, pts2.ex, pts2.ey)) { crossings++; cross_pen++ }
      }
      const sourceBoxId = l1.patchline.source[0]
      const lx0 = Math.min(pts1.sx, pts1.ex) - c.boxZone
      const lx1 = Math.max(pts1.sx, pts1.ex) + c.boxZone
      const ly0 = Math.min(pts1.sy, pts1.ey)
      const ly1 = Math.max(pts1.sy, pts1.ey)
      grid.queryBoxIndices(lx0, ly0, lx1 - lx0, ly1 - ly0, nearbyBoxIdx)
      for (let k = 0; k < nearbyBoxIdx.length; k++) {
        const box = grid.getBox(nearbyBoxIdx[k])
        if (boxLineCollision(box, pts1, c.boxZone)) {
          if (sscSourceIds.has(sourceBoxId) && box.id === sourceBoxId) singleSelfCollisions++
          else collisions++
        }
      }
      const segmentLength = bezierLength(pts1.sx, pts1.sy, c1x, c1y, c2x, c2y, pts1.ex, pts1.ey)
      totalRawLength += segmentLength
      let firstMisalignmentPenalty = 0
      if (l1.patchline.source[1] === 0 && l1.patchline.destination[1] === 0 && pts1.sx !== pts1.ex) {
        misalignedFirst++
        firstMisalignmentPenalty = Math.abs(pts1.sx - pts1.ex) * c.misalignedFirstPenalty
      }
      totalLength += (segmentLength + firstMisalignmentPenalty) * (cross_pen ? cross_pen * c.crossPenalty : 1) * (over_pen ? over_pen * c.overPenalty : 1) * reverse_pen
    }
    for (let i = 0; i < layouts.length; i++) {
      const a = layouts[i]
      grid.queryBoxIndices(a.x - c.minDistX, a.y - c.minDistY, a.width + 2 * c.minDistX, a.height + 2 * c.minDistY, nearbyBoxIdx)
      for (let k = 0; k < nearbyBoxIdx.length; k++) {
        const j = nearbyBoxIdx[k]
        if (j <= i) continue
        const b = grid.getBox(j)
        const sameGroup = a.groupIdx !== undefined && a.groupIdx === b.groupIdx
        if (!sameGroup && getIntersectionArea(a, b, c.minDistX / 2)) area++
        if (sameGroup) continue
        const xGap = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width))
        const yGap = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height))
        if (xGap < c.minDistX && yGap < c.minDistY) minDist++
      }
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
      view ** (c.viewExponent / layouts.length) *
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
