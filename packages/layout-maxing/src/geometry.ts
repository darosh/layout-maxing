import { type Config } from './config.ts'
import { type BoxLayout, type Line } from './layout.ts'

type BoxId = string

export interface StartEnd {
  sx: number
  sy: number
  ex: number
  ey: number
}

// Orientation helper
function ccw(Ax: number, Ay: number, Bx: number, By: number, Cx: number, Cy: number): boolean {
  return (Cy - Ay) * (Bx - Ax) > (By - Ay) * (Cx - Ax)
}

// Proper intersection only (crossing, not just touching or overlapping collinearly)
export function segmentsIntersect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): boolean {
  return (
    ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy) &&
    ccw(cx, cy, dx, dy, ax, ay) !== ccw(cx, cy, dx, dy, bx, by)
  )
}

export function segmentsOverlap(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): boolean {
  // First: must be collinear
  const collinear =
    !ccw(ax, ay, bx, by, cx, cy) &&
    !ccw(ax, ay, bx, by, dx, dy) &&
    !ccw(cx, cy, dx, dy, ax, ay) &&
    !ccw(cx, cy, dx, dy, bx, by)

  if (!collinear) return false

  // Project onto x if not vertical, otherwise onto y
  const isVertical = Math.abs(ax - bx) < 1e-9

  if (isVertical) {
    // Project on Y axis
    const min1 = Math.min(ay, by)
    const max1 = Math.max(ay, by)
    const min2 = Math.min(cy, dy)
    const max2 = Math.max(cy, dy)

    // Overlap if the intervals overlap with positive length
    return Math.max(min1, min2) < Math.min(max1, max2)
  } else {
    // Project on X axis
    const min1 = Math.min(ax, bx)
    const max1 = Math.max(ax, bx)
    const min2 = Math.min(cx, dx)
    const max2 = Math.max(cx, dx)

    return Math.max(min1, min2) < Math.min(max1, max2)
  }
}

// Helper: check if two line segments intersect
function linesIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (den === 0) return false // parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den

  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

export function boxLineCollision(box: BoxLayout, line: StartEnd, zone: number): boolean {
  const left = box.x - zone
  const right = box.x + box.width + zone
  const top = box.y
  const bottom = box.y + box.height

  const { sx, sy, ex, ey } = line

  // Check intersection with each of the 4 sides
  let count = 0

  // Left side
  if (linesIntersect(sx, sy, ex, ey, left, top, left, bottom)) count++
  // Right side
  if (linesIntersect(sx, sy, ex, ey, right, top, right, bottom)) count++
  // Top side
  if (linesIntersect(sx, sy, ex, ey, left, top, right, top)) count++
  // Bottom side
  if (linesIntersect(sx, sy, ex, ey, left, bottom, right, bottom)) count++

  return count > 1
}

export function getIntersectionArea(a: BoxLayout, b: BoxLayout, x: number): number {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.width + x, b.x + b.width + x) - Math.max(a.x - x, b.x - x),
  )

  const yOverlap = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))

  return xOverlap * yOverlap
}

export function bezierLength(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
): number {
  let length = 0
  let prevX = x0
  let prevY = y0
  const steps = 30 // sufficient approximation for fitness

  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    const tt = t * t
    const uu = u * u
    const uuu = uu * u
    const ttt = tt * t

    const x = uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3
    const y = uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3

    length += Math.hypot(x - prevX, y - prevY)
    prevX = x
    prevY = y
  }
  return length
}

export function getOutletPos(
  box: BoxLayout,
  outletIdx: number,
  cfg: Required<Config>,
): [number, number] {
  if (box.numOutlets <= 1) {
    return [box.x + cfg.letOffest, box.y + box.height]
  }

  const portX =
    box.x + cfg.letOffest + (outletIdx / (box.numOutlets - 1)) * (box.width - cfg.letOffest * 2)
  return [portX, box.y + box.height]
}

export function getInletPos(
  box: BoxLayout,
  inletIdx: number,
  cfg: Required<Config>,
): [number, number] {
  if (box.numInlets <= 1) {
    return [box.x + cfg.letOffest, box.y]
  }

  const portX =
    box.x + cfg.letOffest + (inletIdx / (box.numInlets - 1)) * (box.width - cfg.letOffest * 2)
  return [portX, box.y]
}

export function getStraightLinePoints(
  line: Line,
  boxMap: Map<BoxId, BoxLayout>,
  cfg: Required<Config>,
): StartEnd {
  const p = line.patchline
  const [sourceId, outletIdx] = p.source
  const [destId, inletIdx] = p.destination

  const sourceBox = boxMap.get(sourceId)!
  const destBox = boxMap.get(destId)!

  const [sx, sy] = getOutletPos(sourceBox, outletIdx, cfg)
  const [ex, ey] = getInletPos(destBox, inletIdx, cfg)

  return { sx, sy, ex, ey }
}

export function getViewPort(layouts: BoxLayout[], padding: number = 0): number[] {
  if (layouts.length === 0) {
    return [0, 0, 800, 600] // fallback
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const box of layouts) {
    minX = Math.min(minX, box.x)
    minY = Math.min(minY, box.y)
    maxX = Math.max(maxX, box.x + box.width)
    maxY = Math.max(maxY, box.y + box.height)
  }

  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2

  return [
    Math.floor(minX - padding), // x
    Math.floor(minY - padding), // y
    Math.ceil(width), // width
    Math.ceil(height), // height
  ]
}
