<script setup lang="ts">
import type { GenerationSnapshot, RunMonitor } from 'layout-maxing'
import { mutationMeta, statMeta } from 'layout-maxing'
import { computed, ref } from 'vue'
import FlyingTooltip from './FlyingTooltip.vue'

const props = defineProps<{
  snapshots: GenerationSnapshot[]
  runMonitor: RunMonitor | null
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

  const mutationOrder = Object.keys(mutationMeta)

  return mutationOrder
    .filter((name) => name in totals)
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
        impPct: t.attempts > 0 ? (t.improvements / t.attempts) * 100 : 0,
        avgDelta: t.attempts > 0 ? t.totalDelta / t.attempts : 0,
        bestCount,
        deadWeight: props.runMonitor !== null && bestCount === 0,
      }
    })
})

const mutationOrder = computed(() => rows.value.map((r) => r.name))

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
          <td>{{ row.attempts.toLocaleString('en-US', { maximumFractionDigits: 0 }) }}</td>
          <td>{{ row.impPct.toLocaleString('en-US', { maximumFractionDigits: 1 }) }}</td>
          <td :class="row.avgDelta < 0 ? 'good' : 'neutral'">
            {{ row.avgDelta.toLocaleString('en-US', { maximumFractionDigits: 0 }) }}
          </td>
          <td v-if="hasBestData" class="td-best">
            <span v-if="row.bestCount > 0" class="best-count">{{
              row.bestCount.toLocaleString('en-US', { maximumFractionDigits: 0 })
            }}</span>
            <span v-else class="empty">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mut-stats {
  user-select: none;
  font-size: 0.7rem;
}

table {
  border-collapse: collapse;
  font-family: monospace;
  color: var(--p-surface-300);
}

th {
  text-transform: uppercase;
  color: var(--p-surface-500);
  text-align: right;
  padding: 0 0.5rem;
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
  padding: 0 0.5rem;
  color: var(--p-surface-300);
  opacity: 0.95;
}

td.td-name {
  text-align: left;
  color: var(--p-surface-400);
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

.best-count {
  color: var(--p-primary-400);
  font-weight: bold;
}

.empty {
  color: var(--p-surface-600);
}

tr.dead-weight td {
  opacity: 0.75;
  text-decoration: line-through;
  text-decoration-color: var(--p-surface-600);
}

tr.dead-weight td.td-name {
  text-decoration: none;
  color: var(--p-surface-600);
}
</style>
