import { type Box, type Line } from './layout.ts'
import { type StartEnd } from './geometry.ts'

export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

export class SpatialGrid {
  private readonly cellSize: number
  private readonly grid: Map<string, { boxes: Box[]; lines: { lineIdx: number; bbox: BBox }[] }>

  constructor(cellSize: number) {
    this.cellSize = cellSize
    this.grid = new Map()
  }

  private getCellKey(cx: number, cy: number): string {
    return `${cx},${cy}`
  }

  private getCellsForBBox(bbox: BBox): { cx: number; cy: number }[] {
    const cells: { cx: number; cy: number }[] = []
    const startX = Math.floor(bbox.x / this.cellSize)
    const endX = Math.floor((bbox.x + bbox.w) / this.cellSize)
    const startY = Math.floor(bbox.y / this.cellSize)
    const endY = Math.floor((bbox.y + bbox.h) / this.cellSize)

    for (let cx = startX; cx <= endX; cx++) {
      for (let cy = startY; cy <= endY; cy++) {
        cells.push({ cx, cy })
      }
    }
    return cells
  }

  insertBox(box: Box): void {
    const bbox: BBox = { x: box.x, y: box.y, w: box.width, h: box.height }
    const cells = this.getCellsForBBox(bbox)
    for (const { cx, cy } of cells) {
      const key = this.getCellKey(cx, cy)
      let cell = this.grid.get(key)
      if (!cell) {
        cell = { boxes: [], lines: [] }
        this.grid.set(key, cell)
      }
      cell.boxes.push(box)
    }
  }

  insertLine(lineIdx: number, pts: StartEnd): void {
    const bbox: BBox = {
      x: Math.min(pts.sx, pts.ex),
      y: Math.min(pts.sy, pts.ey),
      w: Math.abs(pts.sx - pts.ex),
      h: Math.abs(pts.sy - pts.ey),
    }
    const cells = this.getCellsForBBox(bbox)
    for (const { cx, cy } of cells) {
      const key = this.getCellKey(cx, cy)
      let cell = this.grid.get(key)
      if (!cell) {
        cell = { boxes: [], lines: [] }
        this.grid.set(key, cell)
      }
      cell.lines.push({ lineIdx, bbox })
    }
  }

  queryBoxes(bbox: BBox, out: Set<Box>): void {
    const cells = this.getCellsForBBox(bbox)
    for (const { cx, cy } of cells) {
      const cell = this.grid.get(this.getCellKey(cx, cy))
      if (cell) {
        for (const box of cell.boxes) {
          out.add(box)
        }
      }
    }
  }

  queryLines(bbox: BBox, out: Set<number>): void {
    const cells = this.getCellsForBBox(bbox)
    for (const { cx, cy } of cells) {
      const cell = this.grid.get(this.getCellKey(cx, cy))
      if (cell) {
        for (const lineInfo of cell.lines) {
          out.add(lineInfo.lineIdx)
        }
      }
    }
  }
}
