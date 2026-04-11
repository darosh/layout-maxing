<script setup lang="ts">
import { mutationMeta } from 'layout-maxing'
import { computed, ref } from 'vue'
import FlyingTooltip from './FlyingTooltip.vue'
import type { TopEntry } from '@/stores/optimizer'

const props = defineProps<{
  selectedEntry: TopEntry | null
  mutationOrder: string[]
}>()

const tooltip = ref<InstanceType<typeof FlyingTooltip> | null>(null)

type SelRow = {
  name: string
  shortName: string
  label: string
  description: string
  count: number
  pct: number
}

const selRows = computed((): SelRow[] => {
  const entry = props.selectedEntry
  if (!entry) return []
  const counts = entry.mutations
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const known = ['crossover', ...props.mutationOrder]
  const order = [...known, ...Object.keys(counts).filter((n) => !known.includes(n))]
  return order.map((name): SelRow => {
    const meta = mutationMeta[name]
    const count = counts[name] ?? 0
    return {
      name,
      shortName: meta?.[1] ?? name.slice(0, 4).toUpperCase(),
      label: meta?.[0] ?? name,
      description: meta?.[2] ?? '',
      count,
      pct: (count / total) * 100,
    }
  })
})

function mutTooltip(row: { shortName: string; label: string; description: string }): string {
  return `${row.shortName}: ${row.label}\n${row.description}`
}
</script>

<template>
  <FlyingTooltip ref="tooltip" :max-width="220" />
  <template v-if="selRows.length">
    <table>
      <thead>
        <tr>
          <th class="th-name"></th>
          <th>boxes</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in selRows" :key="row.name" :class="{ 'empty-row': !row.count }">
          <td
            class="td-name th-interactive"
            @mouseenter="tooltip?.show($event, mutTooltip(row))"
            @mouseleave="tooltip?.hide()"
          >
            {{ row.shortName }}
          </td>
          <td>
            <template v-if="row.count">{{
              row.count.toLocaleString('en-US', { maximumFractionDigits: 0 })
            }}</template
            ><template v-else>—</template>
          </td>
          <td class="td-pct">
            <template v-if="row.count">
              {{ row.pct.toLocaleString('en-US', { maximumFractionDigits: 1 }) }}
            </template>
            <template v-else>—</template>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped>
table {
  border-collapse: collapse;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--p-surface-300);
  user-select: none;
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

th.th-interactive {
  cursor: default;
  pointer-events: auto;
}

td {
  text-align: right;
  padding: 0 0.5rem;
  color: var(--p-surface-300);
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

td.td-pct {
  color: var(--p-surface-500);
}

tr.empty-row td {
  opacity: 0.33 !important;
}
</style>
