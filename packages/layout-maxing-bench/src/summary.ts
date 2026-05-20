// LLM-friendly markdown aggregations.

import type { BenchDb, RunRow } from './db.ts'

function fmt(n: number | null, digits = 0): string {
  return n == null ? '—' : Number(n).toFixed(digits)
}

export function summaryMarkdown(db: BenchDb, group?: string, example?: string): string {
  const rows = db.runsBy({ group: group as any, example, limit: 1000 })
  if (!rows.length) return `_no rows for group=${group ?? '*'} example=${example ?? '*'}_`

  const okRows = rows.filter((r) => r.status === 'ok' && r.score_default != null)
  okRows.sort((a, b) => (a.score_default ?? Infinity) - (b.score_default ?? Infinity))

  // Collect swept param names from param_values
  const paramSet = new Set<string>()
  for (const r of okRows.slice(0, 50)) {
    for (const k of Object.keys(db.paramsFor(r.id))) paramSet.add(k)
  }
  const params = Array.from(paramSet).sort()

  const lines: string[] = []
  lines.push(`# bench summary — group=\`${group ?? '*'}\` example=\`${example ?? '*'}\``)
  lines.push(`runs: ${rows.length}  ok: ${okRows.length}  best score_default: ${fmt(okRows[0]?.score_default ?? null)}\n`)

  const header = ['rank', 'run', 'example', 'preset', 'score_default', 'score_custom', 'evals', 'wall_s', ...params]
  lines.push('| ' + header.join(' | ') + ' |')
  lines.push('|' + header.map(() => '---').join('|') + '|')
  for (let i = 0; i < Math.min(25, okRows.length); i++) {
    const r = okRows[i]
    const p = db.paramsFor(r.id)
    const row = [
      String(i + 1),
      String(r.id),
      r.example,
      r.preset ?? '',
      fmt(r.score_default, 0),
      fmt(r.score_custom, 0),
      fmt(r.evals_total),
      fmt(r.wall_ms == null ? null : r.wall_ms / 1000, 1),
      ...params.map((k) => (k in p ? String(p[k]) : '')),
    ]
    lines.push('| ' + row.join(' | ') + ' |')
  }
  return lines.join('\n')
}

export function statusText(db: BenchDb): string {
  const c = db.counts()
  const lines: string[] = ['phase / example         ok    err  total']
  for (const r of c) {
    const label = `${r.group}/${r.example}`.padEnd(24)
    lines.push(`${label}${String(r.ok).padStart(5)}${String(r.err).padStart(6)}${String(r.total).padStart(7)}`)
  }
  const recent = db.recentRuns(5)
  lines.push('')
  lines.push('recent:')
  for (const r of recent) {
    lines.push(
      `  #${r.id}  ${r.group_name}/${r.example}  status=${r.status}  ` +
        `score_d=${r.score_default ?? '—'}  wall=${r.wall_ms ? (r.wall_ms / 1000).toFixed(1) + 's' : '—'}`,
    )
  }
  return lines.join('\n')
}

export function exportRunConfig(db: BenchDb, runId: number): string {
  const r = db.getRun(runId)
  if (!r) throw new Error(`run ${runId} not found`)
  return r.config_json
}

export function topRows(db: BenchDb, example: string, limit = 10): RunRow[] {
  const rows = db.runsBy({ example, limit: 1000 })
  return rows.filter((r) => r.status === 'ok').sort((a, b) => (a.score_default ?? Infinity) - (b.score_default ?? Infinity)).slice(0, limit)
}
