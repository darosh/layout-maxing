// Minimal vanilla JS frontend: polls every 2s, renders tables + scatter.

const groups = ['baseline', 'preset', 'oat', 'stagnation', 'niching', 'cluster', 'mutweights', 'fitness', 'gapfill']
const examples = ['example-1', 'example-2', 'example-3', 'example-4', 'example-5']

const $ = (id) => document.getElementById(id)

function fillSelect(sel, items, current) {
  sel.innerHTML = ''
  for (const it of items) {
    const o = document.createElement('option')
    o.value = it
    o.textContent = it
    if (it === current) o.selected = true
    sel.appendChild(o)
  }
}

fillSelect($('group'), groups, 'preset')
fillSelect($('example'), examples, 'example-2')
fillSelect($('xparam'), ['(auto)'], '(auto)')

function fmt(n, digits = 0) {
  if (n == null) return '—'
  return Number(n).toFixed(digits)
}

function renderTable(target, rows, columns) {
  const head = '<tr>' + columns.map((c) => `<th>${c.label}</th>`).join('') + '</tr>'
  const body = rows
    .map((r) => '<tr>' + columns.map((c) => `<td>${c.get(r)}</td>`).join('') + '</tr>')
    .join('')
  target.innerHTML = head + body
}

async function refreshState() {
  const s = await (await fetch('/api/state')).json()
  $('ts').textContent = new Date(s.now).toLocaleTimeString()
  renderTable($('recent'), s.recent, [
    { label: 'id', get: (r) => r.id },
    { label: 'group/ex', get: (r) => `${r.group_name}/${r.example}` },
    { label: 'status', get: (r) => `<span class="${r.status === 'ok' ? 'ok' : 'err'}">${r.status}</span>` },
    { label: 'score_d', get: (r) => fmt(r.score_default) },
    { label: 'wall', get: (r) => fmt(r.wall_ms / 1000, 1) + 's' },
  ])
  renderTable($('counts'), s.counts, [
    { label: 'group', get: (r) => r.group },
    { label: 'example', get: (r) => r.example },
    { label: 'ok', get: (r) => r.ok },
    { label: 'err', get: (r) => r.err },
    { label: 'total', get: (r) => r.total },
  ])

  const b = await (await fetch('/api/best')).json()
  renderTable($('best'), b.best, [
    { label: 'example', get: (r) => r.example },
    { label: 'score_d', get: (r) => fmt(r.score_default) },
    { label: 'group', get: (r) => r.group_name },
    { label: 'preset', get: (r) => r.preset ?? '' },
    { label: 'run', get: (r) => `<a href="/api/run/${r.id}" target="_blank">#${r.id}</a>` },
  ])
}

async function refreshScatter() {
  const group = $('group').value
  const example = $('example').value
  const res = await (await fetch(`/api/runs?group=${group}&example=${example}&limit=500`)).json()
  const runs = res.runs.filter((r) => r.status === 'ok' && r.score_default != null)
  const paramNames = new Set()
  for (const r of runs) for (const k of Object.keys(r.params)) paramNames.add(k)
  const opts = ['(auto)', ...Array.from(paramNames).sort()]
  const cur = $('xparam').value
  fillSelect($('xparam'), opts, opts.includes(cur) ? cur : '(auto)')

  const xKey = $('xparam').value === '(auto)' ? (opts[1] ?? 'wall_ms') : $('xparam').value

  const canvas = $('scatter')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (!runs.length) {
    ctx.fillStyle = '#6e7681'
    ctx.fillText('no rows', 20, 20)
    return
  }

  const xs = runs.map((r) => (xKey in r.params ? r.params[xKey] : r.wall_ms / 1000))
  const ys = runs.map((r) => r.score_default)
  const xMin = Math.min(...xs), xMax = Math.max(...xs)
  const yMin = Math.min(...ys), yMax = Math.max(...ys)
  const pad = 40
  const W = canvas.width - 2 * pad, H = canvas.height - 2 * pad
  const px = (x) => pad + ((x - xMin) / (xMax - xMin || 1)) * W
  const py = (y) => pad + H - ((y - yMin) / (yMax - yMin || 1)) * H

  ctx.strokeStyle = '#30363d'
  ctx.strokeRect(pad, pad, W, H)
  ctx.fillStyle = '#8b949e'
  ctx.font = '11px ui-monospace, monospace'
  ctx.fillText(`x: ${xKey}  [${xMin.toFixed(2)} … ${xMax.toFixed(2)}]`, pad, pad - 8)
  ctx.fillText(`y: score_default  [${yMin.toFixed(0)} … ${yMax.toFixed(0)}]`, pad, canvas.height - 8)

  for (let i = 0; i < runs.length; i++) {
    ctx.beginPath()
    ctx.arc(px(xs[i]), py(ys[i]), 3, 0, Math.PI * 2)
    ctx.fillStyle = i === 0 ? '#f78166' : '#3fb950'
    ctx.fill()
  }
}

async function tick() {
  try {
    await refreshState()
    await refreshScatter()
  } catch (e) {
    console.error(e)
  }
}

$('group').addEventListener('change', refreshScatter)
$('example').addEventListener('change', refreshScatter)
$('xparam').addEventListener('change', refreshScatter)

tick()
setInterval(tick, 2000)
