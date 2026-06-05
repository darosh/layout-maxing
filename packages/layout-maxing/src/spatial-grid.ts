import { type Box } from './layout.ts'
import { type StartEnd } from './geometry.ts'

export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

// CSR (compressed sparse row) spatial grid.
// Two-pass construction: count → prefix-sum → fill.
// Zero allocations during queries — only typed arrays.
export class SpatialGrid {
  private readonly cs: number
  private readonly x0: number
  private readonly y0: number
  private readonly gridW: number
  private readonly maxCX: number // inclusive upper cell bound
  private readonly maxCY: number

  // Box CSR
  private boxHead!: Int32Array // cell → start index in boxData (-1 = empty)
  private boxNext!: Int32Array // boxData[i] → next index (-1 = end)
  private boxData!: Int32Array // box indices in insertion order per cell chain
  private boxCount = 0

  // Line CSR
  private lineHead!: Int32Array
  private lineNext!: Int32Array
  private lineData!: Int32Array
  private lineCount = 0

  private readonly boxList: Box[]
  private readonly boxGen: Int32Array
  private readonly lineGen: Int32Array
  private gen = 0

  constructor(
    cellSize: number,
    boxCount: number,
    lineCount: number,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    boxSlots: number,
    lineSlots: number,
  ) {
    this.cs = cellSize
    this.x0 = Math.floor(minX / cellSize)
    this.y0 = Math.floor(minY / cellSize)
    this.maxCX = Math.floor(maxX / cellSize)
    this.maxCY = Math.floor(maxY / cellSize)
    this.gridW = this.maxCX - this.x0 + 2
    const gridH = this.maxCY - this.y0 + 2
    const size = this.gridW * gridH

    this.boxHead = new Int32Array(size).fill(-1)
    this.boxNext = new Int32Array(boxSlots).fill(-1)
    this.boxData = new Int32Array(boxSlots)

    this.lineHead = new Int32Array(size).fill(-1)
    this.lineNext = new Int32Array(lineSlots).fill(-1)
    this.lineData = new Int32Array(lineSlots)

    this.boxList = Array.from({ length: boxCount })
    this.boxGen = new Int32Array(boxCount)
    this.lineGen = new Int32Array(lineCount)
  }

  private cellIdx(cx: number, cy: number): number {
    return (cy - this.y0) * this.gridW + (cx - this.x0)
  }

  private clampX(cx: number): number {
    return cx < this.x0 ? this.x0 : cx > this.maxCX ? this.maxCX : cx
  }
  private clampY(cy: number): number {
    return cy < this.y0 ? this.y0 : cy > this.maxCY ? this.maxCY : cy
  }

  insertBox(boxIdx: number, box: Box): void {
    this.boxList[boxIdx] = box
    const cs = this.cs
    const x0 = this.clampX(Math.floor(box.x / cs)),
      x1 = this.clampX(Math.floor((box.x + box.width) / cs))
    const y0 = this.clampY(Math.floor(box.y / cs)),
      y1 = this.clampY(Math.floor((box.y + box.height) / cs))
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const k = this.cellIdx(cx, cy)
        const slot = this.boxCount++
        this.boxData[slot] = boxIdx
        this.boxNext[slot] = this.boxHead[k]
        this.boxHead[k] = slot
      }
    }
  }

  insertLine(lineIdx: number, pts: StartEnd): void {
    const cs = this.cs
    const lx = Math.min(pts.sx, pts.ex),
      ly = Math.min(pts.sy, pts.ey)
    const x0 = this.clampX(Math.floor(lx / cs)),
      x1 = this.clampX(Math.floor((lx + Math.abs(pts.sx - pts.ex)) / cs))
    const y0 = this.clampY(Math.floor(ly / cs)),
      y1 = this.clampY(Math.floor((ly + Math.abs(pts.sy - pts.ey)) / cs))
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const k = this.cellIdx(cx, cy)
        const slot = this.lineCount++
        this.lineData[slot] = lineIdx
        this.lineNext[slot] = this.lineHead[k]
        this.lineHead[k] = slot
      }
    }
  }

  queryBoxIndices(x: number, y: number, w: number, h: number, out: number[]): void {
    out.length = 0
    const cs = this.cs
    const x0 = this.clampX(Math.floor(x / cs)),
      x1 = this.clampX(Math.floor((x + w) / cs))
    const y0 = this.clampY(Math.floor(y / cs)),
      y1 = this.clampY(Math.floor((y + h) / cs))
    const g = ++this.gen
    const bg = this.boxGen,
      bh = this.boxHead,
      bn = this.boxNext,
      bd = this.boxData
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        let slot = bh[this.cellIdx(cx, cy)]
        while (slot !== -1) {
          const idx = bd[slot]
          if (bg[idx] !== g) {
            bg[idx] = g
            out.push(idx)
          }
          slot = bn[slot]
        }
      }
    }
  }

  queryLineIndices(x: number, y: number, w: number, h: number, out: number[]): void {
    out.length = 0
    const cs = this.cs
    const x0 = this.clampX(Math.floor(x / cs)),
      x1 = this.clampX(Math.floor((x + w) / cs))
    const y0 = this.clampY(Math.floor(y / cs)),
      y1 = this.clampY(Math.floor((y + h) / cs))
    const g = ++this.gen
    const lg = this.lineGen,
      lh = this.lineHead,
      ln = this.lineNext,
      ld = this.lineData
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        let slot = lh[this.cellIdx(cx, cy)]
        while (slot !== -1) {
          const idx = ld[slot]
          if (lg[idx] !== g) {
            lg[idx] = g
            out.push(idx)
          }
          slot = ln[slot]
        }
      }
    }
  }

  getBox(idx: number): Box {
    return this.boxList[idx]
  }
}
