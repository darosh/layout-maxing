// `bench show` server. Serves a tiny static UI + JSON API.

import { dirname, fromFileUrl, resolve } from 'jsr:@std/path'
import { openDb } from '../db.ts'

const HERE = dirname(fromFileUrl(import.meta.url))

async function readStatic(name: string, contentType: string): Promise<Response> {
  const path = resolve(HERE, name)
  const body = await Deno.readFile(path)
  return new Response(body, { headers: { 'content-type': contentType } })
}

export async function startServer(dbPath: string, port: number) {
  const db = openDb(dbPath)
  console.log(`bench show: http://localhost:${port}  (db: ${dbPath})`)

  Deno.serve({ port }, (req) => {
    const url = new URL(req.url)
    const path = url.pathname

    if (path === '/' || path === '/index.html') return readStatic('index.html', 'text/html; charset=utf-8')
    if (path === '/app.js') return readStatic('app.js', 'application/javascript; charset=utf-8')

    if (path === '/api/state') {
      const recent = db.recentRuns(10)
      const counts = db.counts()
      return Response.json({ recent, counts, now: Date.now() })
    }
    if (path === '/api/best') {
      return Response.json({ best: db.bestPerExample() })
    }
    if (path === '/api/runs') {
      const group = url.searchParams.get('group') as any
      const example = url.searchParams.get('example') ?? undefined
      const limit = Number(url.searchParams.get('limit') ?? '500')
      const rows = db.runsBy({ group, example, limit })
      const withParams = rows.map((r) => ({ ...r, params: db.paramsFor(r.id) }))
      return Response.json({ runs: withParams })
    }
    if (path.startsWith('/api/run/')) {
      const id = Number(path.split('/').pop())
      const r = db.getRun(id)
      if (!r) return new Response('not found', { status: 404 })
      return Response.json({ run: r, params: db.paramsFor(id) })
    }

    return new Response('not found', { status: 404 })
  })

  await new Promise(() => {}) // keep alive
}
