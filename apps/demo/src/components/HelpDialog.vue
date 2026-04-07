<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import Dialog from 'primevue/dialog'
import { configMeta } from 'layout-maxing'

defineProps<{ visible: boolean }>()
defineEmits<{ 'update:visible': [value: boolean] }>()

const entries = Object.entries(configMeta) as [
  string,
  [number | boolean, number | boolean, number | boolean, number | null, string],
][]

function rangeMeta(entry: (typeof entries)[number][1]): string {
  const [def, min, max, step] = entry
  if (typeof def === 'boolean') return ``
  return `${min} – ${max}`
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="Help"
    modal
    dismissable-mask
    :closeButtonProps="{ text: true, size: 'small' }"
    :style="{ naxWidth: '100%', maxHeight: '80vh' }"
    :draggable="false"
    @update:visible="$emit('update:visible', $event)"
  >
    <h4>Hot keys</h4>
    <ul class="list">
      <li>
        <kbd>Option</kbd>
        <ul>
          <li>
            switching <code>Optimization</code> to <code>Re-run</code> (reusing recent output as
            input, <code>useInput</code> should be turned on)
          </li>
          <li>switching <code>Download</code> to <code>Copy</code></li>
        </ul>
      </li>
      <li>
        Configuration editing
        <ul>
          <li><kbd>Shift + Enter</kbd> resets to default value</li>
          <li><kbd>Shift + Down</kbd> sets minimum value</li>
          <li><kbd>Shift + Up</kbd> sets maximum value</li>
        </ul>
      </li>
    </ul>
    <h4>Configuration</h4>
    <table class="help-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Description</th>
          <th>Range</th>
          <th>Default</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[key, meta] in entries" :key="key">
          <td class="help-key">{{ key }}</td>
          <td class="help-desc">{{ meta[4] }}</td>
          <td class="help-range">{{ rangeMeta(meta) }}</td>
          <td class="help-default">{{ meta[0] }}</td>
        </tr>
      </tbody>
    </table>
  </Dialog>
</template>

<style scoped>
.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.help-table th {
  text-align: left;
  padding: 0.75rem 0.5rem;
  color: var(--p-surface-400);
  font-weight: 600;
  border-bottom: 1px solid var(--p-surface-700);
}

.help-table td {
  padding: 0.75rem 0.5rem;
  vertical-align: top;
  border-bottom: 1px solid var(--p-surface-800);
}

.help-key {
  font-family: monospace;
  color: var(--p-surface-200);
  white-space: nowrap;
}

.help-desc {
  color: var(--p-surface-300);
}

.help-range {
  font-family: monospace;
  color: var(--p-surface-400);
  white-space: nowrap;
}

.help-default {
  font-family: monospace;
  color: var(--p-surface-400);
  white-space: nowrap;
}

.list li {
  line-height: 1.75rem;
  margin-left: 0rem;
  padding-left: 0rem;
}

.list,
.list ul {
  padding-inline-start: 2rem;
  font-size: 1rem;
}
</style>
