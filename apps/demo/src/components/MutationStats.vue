<script setup lang="ts">
import type { GenerationSnapshot, RunMonitor } from 'layout-maxing'
import { mutationMeta, statMeta } from 'layout-maxing'
import { computed, ref } from 'vue'
import FlyingTooltip from './FlyingTooltip.vue'
import type { TopEntry } from '@/stores/optimizer'

const props = defineProps<{
  snapshots: GenerationSnapshot[]
  runMonitor: RunMonitor | null
  selectedEntry: TopEntry | null
}>()

const tooltip = ref<InstanceType<typeof FlyingTooltip> | null>(null)

type MutRow = {
  name: string
  shortName: string
  label: string
  description: string
  attempts: number
  impPct: number
  avgDelta: number
  bestCount: number
  deadWeight: boolean
}

type SelRow = {
  name: string
  shortName: string
  label: string
  description: string
  count: number
  pct: number
}

const rows = computed((): MutRow[] => {
  const snaps = props.snapshots
  if (!snaps.length) return []

  const totals: Record<string, { attempts: number; improvements: number; totalDelta: number }> = {}
  for (const snap of snaps) {
    for (const [name, stat] of Object.entries(snap.mutations)) {
      if (!totals[name]) totals[name] = { attempts: 0, improvements: 0, totalDelta: 0 }
      totals[name].attempts += stat.attempts
      totals[name].improvements += stat.improvements
      totals[name].totalDelta += stat.totalDelta
    }
  }

  const bestCounts: Record<string, number> = {}
  if (props.runMonitor) {
    for (const event of props.runMonitor.bestLineage) {
      bestCounts[event.mutation] = (bestCounts[event.mutation] ?? 0) + 1
    }
  }

  return Object.keys(totals)
    .map((name): MutRow => {
      const t = totals[name]!
      const meta = mutationMeta[name]
      const bestCount = bestCounts[name] ?? 0
      return {
        name,
        shortName: meta?.[1] ?? name.slice(0, 4).toUpperCase(),
        label: meta?.[0] ?? name,
        description: meta?.[2] ?? '',
        attempts: t.attempts,
        impPct: t.attempts > 0 ? Math.round((t.improvements / t.attempts) * 100) : 0,
        avgDelta: t.attempts > 0 ? t.totalDelta / t.attempts : 0,
        bestCount,
        deadWeight: props.runMonitor !== null && bestCount === 0,
      }
    })
    .sort((a, b) => b.bestCount - a.bestCount || b.impPct - a.impPct)
})

// Per-mutation breakdown for the selected entry (summed across all boxes' histories)
const selRows = computed((): SelRow[] => {
  const entry = props.selectedEntry
  if (!entry) return []
  const counts = entry.mutations
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts)
    .map(([name, count]): SelRow => {
      const meta = mutationMeta[name]
      return {
        name,
        shortName: meta?.[1] ?? name.slice(0, 4).toUpperCase(),
        label: meta?.[0] ?? name,
        description: meta?.[2] ?? '',
        count,
        pct: Math.round((count / total) * 100),
      }
    })
    .sort((a, b) => b.count - a.count)
})

const hasBestData = computed(() => props.runMonitor !== null)

function mutTooltip(row: { shortName: string; label: string; description: string }): string {
  return `${row.shortName}: ${row.label}\n${row.description}`
}

function colTooltip(key: string): string {
  const meta = statMeta[key]
  if (!meta) return ''
  return `${meta[1]}: ${meta[0]}\n${meta[2]}`
}
</script>

<template>
  <FlyingTooltip ref="tooltip" :max-width="220" />
  <div v-if="snapshots.length >= 1 && rows.length" class="mut-stats">
    <!-- Overall stats table -->
    <table>
      <thead>
        <tr>
          <th class="th-name"></th>
          <th
            class="th-interactive"
            @mouseenter="tooltip?.show($event, colTooltip('att'))"
            @mouseleave="tooltip?.hide()"
          >
            att
          </th>
          <th
            class="th-interactive"
            @mouseenter="tooltip?.show($event, colTooltip('imp'))"
            @mouseleave="tooltip?.hide()"
          >
            imp%
          </th>
          <th
            class="th-interactive"
            @mouseenter="tooltip?.show($event, colTooltip('davg'))"
            @mouseleave="tooltip?.hide()"
          >
            Δavg
          </th>
          <th
            v-if="hasBestData"
            class="th-interactive th-best"
            @mouseenter="tooltip?.show($event, colTooltip('best'))"
            @mouseleave="tooltip?.hide()"
          >
            best
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name" :class="{ 'dead-weight': row.deadWeight }">
          <td
            class="td-name th-interactive"
            @mouseenter="tooltip?.show($event, mutTooltip(row))"
            @mouseleave="tooltip?.hide()"
          >
            {{ row.shortName }}
          </td>
          <td>{{ row.attempts }}</td>
          <td>{{ row.impPct }}</td>
          <td :class="row.avgDelta < 0 ? 'good' : 'neutral'">{{ row.avgDelta.toFixed(1) }}</td>
          <td v-if="hasBestData" class="td-best">
            <span v-if="row.bestCount > 0" class="best-count">{{ row.bestCount }}</span>
            <span v-else class="empty">—</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="hasBestData" class="legend">
      <span class="legend-dead-example">SNGL</span> = dead weight
    </div>

    <!-- Selected item breakdown -->
    <template v-if="selRows.length">
      <div class="section-divider"></div>
      <table>
        <thead>
          <tr>
            <th class="th-name" colspan="3">selected</th>
          </tr>
          <tr>
            <th class="th-name"></th>
            <th>boxes</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in selRows" :key="row.name">
            <td
              class="td-name th-interactive"
              @mouseenter="tooltip?.show($event, mutTooltip(row))"
              @mouseleave="tooltip?.hide()"
            >
              {{ row.shortName }}
            </td>
            <td>{{ row.count }}</td>
            <td class="td-pct">{{ row.pct }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.mut-stats {
  user-select: none;
  background: color-mix(in srgb, var(--p-surface-900) 70%, transparent);
  border-radius: 4px;
  padding: 0.3rem 0.4rem;
}

table {
  border-collapse: collapse;
  font-family: monospace;
  font-size: 8px;
  color: var(--p-surface-300);
  line-height: 1.5;
}

th {
  font-size: 7px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-surface-500);
  text-align: right;
  padding: 0 2px;
  font-weight: normal;
}

th.th-name {
  text-align: left;
}

th.th-best {
  color: var(--p-primary-400);
}

th.th-interactive {
  cursor: default;
  pointer-events: auto;
}

th.th-interactive:hover {
  color: var(--p-surface-300);
}

td {
  text-align: right;
  padding: 0 2px;
  color: var(--p-surface-300);
  opacity: 0.85;
}

td.td-name {
  text-align: left;
  color: var(--p-surface-400);
  padding-right: 6px;
  letter-spacing: 0.03em;
  cursor: default;
  pointer-events: auto;
}

td.td-name:hover {
  color: var(--p-surface-200);
}

td.good {
  color: var(--p-green-500);
}

td.neutral {
  color: var(--p-surface-500);
}

td.td-best {
  text-align: right;
  min-width: 20px;
}

td.td-pct {
  color: var(--p-surface-500);
  min-width: 20px;
}

.best-count {
  color: var(--p-primary-400);
  font-weight: bold;
}

.empty {
  color: var(--p-surface-600);
}

tr.dead-weight td {
  opacity: 0.35;
  text-decoration: line-through;
  text-decoration-color: var(--p-surface-600);
}

tr.dead-weight td.td-name {
  text-decoration: none;
  color: var(--p-surface-600);
}

.legend {
  font-family: monospace;
  font-size: 7px;
  color: var(--p-surface-600);
  margin-top: 0.2rem;
  text-align: right;
}

.legend-dead-example {
  opacity: 0.35;
  text-decoration: line-through;
  text-decoration-color: var(--p-surface-600);
  color: var(--p-surface-400);
}

.section-divider {
  height: 1px;
  background: var(--p-surface-700);
  margin: 0.35rem 0;
  opacity: 0.5;
}
</style>
