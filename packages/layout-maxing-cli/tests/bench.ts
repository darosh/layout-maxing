import { fitness } from '../../layout-maxing/src/fitness.ts'
import { fitness as fitnessOpt } from '../../layout-maxing/src/fitness-optimized.ts'
import { createInitialLayouts, PRESETS } from 'layout-maxing'

for (const [file, preset] of [
  ['fixtures/the-synth.json', undefined],
  ['fixtures/the-voice.rnbopat', PRESETS.Clustered],
] as const) {
  const raw = JSON.parse(await Deno.readTextFile(file))
  const patcher = raw.patcher ?? raw
  const layouts = createInitialLayouts(patcher)
  const lines = patcher.lines
  console.log(`\n${file.split('/').pop()}: ${layouts.length} boxes, ${lines.length} lines`)
  const N = 3000
  for (let i = 0; i < 200; i++) fitness(layouts, lines, preset)
  for (let i = 0; i < 200; i++) fitnessOpt(layouts, lines, preset)
  const t0 = performance.now()
  for (let i = 0; i < N; i++) fitness(layouts, lines, preset)
  const t1 = performance.now()
  for (let i = 0; i < N; i++) fitnessOpt(layouts, lines, preset)
  const t2 = performance.now()
  const orig = ((t1 - t0) / N) * 1000,
    opt = ((t2 - t1) / N) * 1000
  console.log(`original:  ${orig.toFixed(1)} µs/call`)
  console.log(`optimized: ${opt.toFixed(1)} µs/call`)
  console.log(`speedup:   ${(orig / opt).toFixed(2)}x`)
}
