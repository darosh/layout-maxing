<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import Dialog from 'primevue/dialog'
import { configMeta } from 'layout-maxing'
import { computed } from 'vue'
import IntroSection from '@/components/IntroSection.vue'

const props = defineProps<{ visible: boolean; isMac?: boolean; pasteKey?: string }>()
defineEmits<{ 'update:visible': [value: boolean] }>()

const modKey = computed(() => (props.isMac ? '⌘ ' : 'Ctrl +'))
const altKey = computed(() => (props.isMac ? '⌥ ' : 'Alt +'))

const entries = Object.entries(configMeta) as [string, [number | boolean, number | boolean, number | boolean, number | null, string]][]

function rangeMeta(entry: (typeof entries)[number][1]): string {
  const [def, min, max, step] = entry
  if (typeof def === 'boolean') return ``
  return `${min} – ${max}`
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    dismissable-mask
    :closeButtonProps="{ text: true, size: 'small' }"
    :style="{ naxWidth: '100%', maxHeight: '80vh' }"
    :draggable="false"
    @update:visible="$emit('update:visible', $event)">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">Help</span>
        <nav class="toc">
          <a @click.prevent="scrollTo('help-about')">About</a>
          <a @click.prevent="scrollTo('help-hotkeys')">Hot keys</a>
          <a @click.prevent="scrollTo('help-config')">Configuration</a>
        </nav>
      </div>
    </template>
    <div class="scroll-container">
      <section
        id="help-about"
        style="margin-top: 4px">
        <IntroSection
          :paste-key="props.pasteKey"
          :bright="true"
          @example-click="$emit('update:visible', false)" />
      </section>
      <h4 id="help-hotkeys">Hot keys</h4>
      <table class="help-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="help-key"><kbd>R</kbd></td>
            <td class="help-desc">Run optimization</td>
          </tr>
          <tr>
            <td class="help-key">
              <kbd>{{ altKey }}R</kbd>
            </td>
            <td class="help-desc"> Re-run (uses best result as initial positions, when <code>useInput</code>> is on) </td>
          </tr>
          <tr>
            <td class="help-key">
              <kbd>{{ modKey }}C</kbd>
            </td>
            <td class="help-desc">Copy layout to clipboard</td>
          </tr>
          <tr>
            <td class="help-key">
              <kbd>{{ modKey }}V</kbd>
            </td>
            <td class="help-desc">Paste layout from clipboard</td>
          </tr>
          <tr>
            <td class="help-key">
              <kbd>{{ altKey }}</kbd> hold
            </td>
            <td class="help-desc"> Switches <code>Run</code> → <code>Re-run</code> button; <code>Download</code> → <code>Copy</code> button </td>
          </tr>
          <tr>
            <td class="help-key"><kbd>Shift + Enter</kbd></td>
            <td class="help-desc">Reset config field to default value</td>
          </tr>
          <tr>
            <td class="help-key"><kbd>Shift + ↓</kbd></td>
            <td class="help-desc">Set config field to minimum value</td>
          </tr>
          <tr>
            <td class="help-key"><kbd>Shift + ↑</kbd></td>
            <td class="help-desc">Set config field to maximum value</td>
          </tr>
        </tbody>
      </table>
      <h4 id="help-config">Configuration</h4>
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
          <tr
            v-for="[key, meta] in entries"
            :key="key">
            <td class="help-key">{{ key }}</td>
            <td class="help-desc">{{ meta[4] }}</td>
            <td class="help-range">{{ rangeMeta(meta) }}</td>
            <td class="help-default">{{ meta[0] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Dialog>
</template>

<style>
.p-dialog-content {
  scroll-behavior: smooth;
}
</style>

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

.help-table tbody tr:last-child td {
  border-bottom: none;
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

h4 {
  margin-top: 2.5rem;
  margin-bottom: 0;
}

.dialog-header {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
}

.dialog-title {
  font-weight: 700;
  font-size: 1.25rem;
}

.toc {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.toc a {
  color: var(--p-primary-400);
  text-decoration: none;
  cursor: pointer;
}

.toc a:hover {
  color: var(--p-primary-300);
  text-decoration: underline;
}
</style>
