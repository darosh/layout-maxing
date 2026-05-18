import { fitness, precomputeTopology } from 'layout-maxing'
import type { Box, Config, Line, Topology } from 'layout-maxing'

let cfg: Config
let cachedTopology: Topology | undefined
let cachedTopoKey = ''

function topoKey(lines: Line[]): string {
  if (!lines.length) return '0'
  const first = lines[0].patchline
  const last = lines[lines.length - 1].patchline
  return `${lines.length}:${first.source[0]}-${first.destination[0]}:${last.source[0]}-${last.destination[0]}`
}

self.onmessage = (e) => {
  if (e.data.type === 'init') {
    cfg = e.data.cfg
    cachedTopology = undefined
    cachedTopoKey = ''
  } else {
    const layouts: Box[] = e.data[0]
    const lines: Line[] = e.data[1]
    const key = topoKey(lines)
    if (key !== cachedTopoKey) {
      cachedTopology = precomputeTopology(lines, layouts)
      cachedTopoKey = key
    }
    self.postMessage(fitness(layouts, lines, cfg, cachedTopology))
  }
}
