import { createInitialLayouts, defaultConfig, fitness, main, toSvg } from 'layout-maxing'
import type { BoxLayout, Config, Fitness, RNBO } from 'layout-maxing'
import { cpus } from 'node:os'
import { dirname, parse, format } from 'jsr:@std/path'

declare const Deno: typeof globalThis.Deno

function parseArgs(args: string[]): { positional: string[]; cfg: Config } {
  const flags = new Map<string, string | true>()
  const positional: string[] = []
  let i = 0
  while (i < args.length) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        flags.set(key, next)
        i += 2
      } else {
        flags.set(key, true)
        i += 1
      }
    } else {
      positional.push(arg)
      i += 1
    }
  }

  let fileCfg: Config = {}
  const cfgPath = flags.get('cfg')
  if (cfgPath && cfgPath !== true) {
    const text = Deno.readTextFileSync(cfgPath)
    fileCfg = JSON.parse(text) as Config
    flags.delete('cfg')
  }

  const cliCfg: Config = {}
  for (const [key, raw] of flags) {
    if (!(key in defaultConfig)) continue
    const k = key as keyof Config
    const defaultVal = defaultConfig[k]
    if (typeof defaultVal === 'boolean') {
      ;(cliCfg as Record<string, unknown>)[k] = raw === true || raw === 'true'
    } else {
      const n = parseFloat(raw as string)
      if (!isNaN(n)) (cliCfg as Record<string, unknown>)[k] = n
    }
  }

  return { positional, cfg: { ...fileCfg, ...cliCfg } }
}

function getWorkers() {
  const CPUS = Math.max(2, cpus().length - 1)

  const fitnessWorkers = Array.from({ length: CPUS }).map(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
      type: 'module',
    })

    const workerInfo: {
      worker: Worker
      resolve?: (value: PromiseLike<Fitness>) => void
    } = {
      worker,
    }

    worker.onmessage = (e) => {
      if (workerInfo.resolve) {
        workerInfo.resolve(e.data)
        workerInfo.resolve = undefined
        runNext()
      }
    }

    return workerInfo
  })

  const fitnessWorkersQueue: {
    input: unknown
    resolve: (value: PromiseLike<Fitness>) => void
  }[] = []

  function terminateWorkers() {
    for (const { worker } of fitnessWorkers) {
      worker.terminate()
    }
  }

  function runNext() {
    if (!fitnessWorkersQueue.length) {
      return
    }

    const free = fitnessWorkers.find((w) => !w.resolve)

    if (!free) {
      return
    }

    const next = fitnessWorkersQueue.shift()!

    free.resolve = next.resolve
    free.worker.postMessage(next.input)
  }

  function getFitness(...input: unknown[]) {
    return new Promise<Fitness>((resolve) => {
      fitnessWorkersQueue.push({ input, resolve })
      runNext()
    })
  }

  return { CPUS, getFitness, terminateWorkers }
}

async function cli() {
  if (!globalThis.Deno) {
    console.log('Deno required')
  } else {
    const command = Deno.args[0]
    const { positional, cfg } = parseArgs(Deno.args.slice(1))

    if (command === 'layout') {
      const { CPUS, getFitness, terminateWorkers } = getWorkers()

      console.log(`Using ${CPUS} workers.`)

      const filePath = positional[0]
      const outPath = positional[1]
      const jsonText = await Deno.readTextFile(filePath)
      const rnbo: RNBO = JSON.parse(jsonText)
      const lines = rnbo.patcher.lines
      const outputPath =
        outPath ?? format({ ...parse(filePath), name: `${parse(filePath).name}_updated` })

      await Deno.mkdir(dirname(outputPath), { recursive: true })

      await main(
        rnbo,
        getFitness,
        (layouts: BoxLayout[]) => {
          const svg = toSvg(layouts, lines, cfg)
          const svgPath = `${outputPath}.svg`

          void Deno.writeTextFile(svgPath, svg).then(() => {
            console.log(`SVG visualization of the layout written to: ${svgPath}`)
          })
        },
        cfg,
      )

      // Write optimized file
      await Deno.writeTextFile(outputPath, JSON.stringify(rnbo, null, 2))
      console.log(`Full RNBO JSON with optimized layout written to: ${outputPath}`)

      const layouts = createInitialLayouts(rnbo.patcher)

      // Write JSON file
      const json = JSON.stringify({ layouts, lines }, null, 0)
      const jsonPath = `${outputPath}.json`
      await Deno.writeTextFile(jsonPath, json)
      console.log(`JSON data written to: ${jsonPath}`)

      // Write SVG file
      const svg = toSvg(layouts, lines, cfg)
      const svgPath = `${outputPath}.svg`
      await Deno.writeTextFile(svgPath, svg)
      console.log(`SVG visualization of the layout written to: ${svgPath}`)

      terminateWorkers()
    } else if (command === 'fitness') {
      const filePath = positional[0]
      const jsonText = await Deno.readTextFile(filePath)
      const rnbo: RNBO = JSON.parse(jsonText)
      const lines = rnbo.patcher.lines
      const baseLayouts = createInitialLayouts(rnbo.patcher)
      const inputFitness = fitness(baseLayouts, lines, cfg)

      console.log(`Input fitness ${inputFitness.score.toFixed(0)}\n${JSON.stringify(inputFitness)}`)
    } else {
      console.log('Command missing')
    }
  }
}

cli().catch((error) => console.error(error))
