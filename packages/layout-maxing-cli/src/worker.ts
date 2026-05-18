import { fitness } from 'layout-maxing'
import type { Line, Config } from 'layout-maxing'

let storedLines: Line[] = []
let storedCfg: Config = {}

self.onmessage = (e) => {
  const msg = e.data
  if (msg.type === 'init') {
    storedLines = msg.lines
    if (msg.cfg !== undefined) storedCfg = msg.cfg
    return
  }
  // msg.type === 'eval': lines always come from stored state, cfg optionally overridden per eval
  self.postMessage(fitness(msg.layouts, storedLines, msg.cfg ?? storedCfg))
}
