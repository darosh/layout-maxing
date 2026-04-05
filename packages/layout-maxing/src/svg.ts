import { type Config, defaultConfig } from './config.ts'
import { type BoxLayout, type Line } from './layout.ts'
import { getOutletPos, getInletPos, getStraightLinePoints, getViewPort } from './geometry.ts'

type BoxId = string

export function toSvg(layouts: BoxLayout[], lines: Line[], cfg?: Config): string {
  const c = { ...defaultConfig, ...cfg }
  const boxMap = new Map<BoxId, BoxLayout>()
  for (const b of layouts) {
    boxMap.set(b.id, b)
  }

  const viewPort = getViewPort(layouts, c.gridX)
  // style="background:#1e1e1e"
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewPort[2]}" height="${viewPort[3]}" viewBox="${viewPort.join(' ')}">`

  // const area = getViewPort(layouts, 0)
  // svg += `<rect x="${area[0]}" y="${area[1]}" width="${area[2]}" height="${area[3]}" fill="#2e2e2e" fill-opacity=".5" />`

  // Draw boxes (rectangles only - no text)
  for (const box of layouts) {
    svg += `\n  <rect
    x="${box.x}"
    y="${box.y}"
    width="${box.width}"
    height="${box.height}"
    rx="4"
    fill="#ccc"
    fill-opacity=".15"
    stroke="#666"
    stroke-width="3"/>`
  }

  // Draw lines with proper segmentation for intersection-aware rendering
  for (const line of lines) {
    const p = line.patchline
    const [sourceId, outletIdx] = p.source
    const [destId, inletIdx] = p.destination

    const sourceBox = boxMap.get(sourceId)
    const destBox = boxMap.get(destId)

    if (!sourceBox || !destBox) continue

    const [sx, sy] = getOutletPos(sourceBox, outletIdx, c)
    const [ex, ey] = getInletPos(destBox, inletIdx, c)

    // Bezier control points (same as used in fitness)
    const c1x = sx
    const c1y = sy + c.curveControl
    const c2x = ex
    const c2y = ey - c.curveControl

    // Draw the curved connection using cubic bezier
    svg += `\n  <path
    d="M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}"
    fill="none"
    stroke="#00ccff"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"/>`

    // Optional: small circles at connection points (ports)
    svg += `\n  <circle cx="${sx}" cy="${sy}" r="3" fill="#00ccff"/>`
    svg += `\n  <circle cx="${ex}" cy="${ey}" r="3" fill="#00ccff"/>`
  }

  if (c.showStraightLines) {
    for (const line of lines) {
      const { sx, sy, ex, ey } = getStraightLinePoints(line, boxMap, c)

      svg += `\n  <line
    x1="${sx}"
    y1="${sy}"
    x2="${ex}"
    y2="${ey}"
    fill="none"
    stroke="#ff0000"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"/>`

      svg += `\n  <circle cx="${sx}" cy="${sy}" r="1.5" fill="#ff0000"/>`
      svg += `\n  <circle cx="${ex}" cy="${ey}" r="1.5" fill="#ff0000"/>`
    }
  }

  svg += `\n</svg>`

  return svg
}
