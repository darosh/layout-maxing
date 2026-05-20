<script setup lang="ts">
import Button from 'primevue/button'
import { useOptimizerStore } from '@/stores/optimizer'
import { EXAMPLES } from '@/utils/examples.ts'

const version = __APP_VERSION__
const store = useOptimizerStore()

defineProps<{
  pasteKey?: string
  bright?: boolean
}>()

const emit = defineEmits<{ 'example-click': [] }>()
</script>

<template>
  <div :class="['intro', { bright }]">
    <div
      v-if="!bright"
      class="header">
      layout-maxing <span class="version">v{{ version }}</span>
    </div>
    <div class="subtitle">
      A
      <a
        href="https://cycling74.com/products/max"
        target="_blank"
        >Max</a
      >
      patch layout utility powered by genetic algorithm
    </div>
    <ul class="list">
      <li>Select or drop a Max patch in the top left area</li>
      <li>
        Or paste a patch from clipboard&nbsp;<span
          v-if="pasteKey"
          class="hint"
          >({{ pasteKey }})</span
        >
      </li>
      <li>
        Or select an example
        <span class="example-row">
          <Button
            v-for="(example, i) in EXAMPLES"
            :key="i"
            variant="outlined"
            :label="`${i + 1}`"
            size="small"
            severity="info"
            @click="store.loadFile(example, `example-${i + 1}`, 'clipboard'); emit('example-click')" />
        </span>
      </li>
      <li><div>Try <b>Default</b> or <b>Niching*</b> presets, and for more complex patches like number 5 <b>Clustered*</b> presets</div></li>
    </ul>
    <div class="footnote">
      All JSON based Max file types are supported: <span class="hint">MAXPAT</span>, <span class="hint">RNBOPAT</span>,
      <span class="hint">GENDSP</span>.<br />For <span class="hint">AMXD</span> files use clipboard copy/paste.<br />Groups are supported. Line segmentation is
      not supported.<br />
      Sub-patchers are not processed.<br />
      Orphaned boxes are ignored by default.
    </div>
    <div class="footnote"> All processing happens locally in the browser.<br />Your patch is not sent over the internet. </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  align-items: left;
  color: var(--p-surface-600);
  font-size: 0.9rem;
  line-height: 1.8rem;
}

.intro.bright {
  color: var(--p-surface-300);
  font-size: 1rem;
}

.header {
  color: var(--p-surface-400);
  font-family: monospace;
  font-size: 0.875rem;
  display: flex;
  gap: 1rem;
  align-content: end;
}

.bright .header {
  color: var(--p-surface-300);
}

.version {
  color: var(--p-surface-600);
  font-size: 0.875rem;
}

.bright .version {
  color: var(--p-surface-400);
}

.hint {
  color: var(--p-surface-400);
  font-size: 0.85em;
}

.bright .hint {
  color: var(--p-surface-300);
}

.subtitle {
  margin: 0 0 1.6rem 0;
}

.footnote {
  margin-top: 1.6rem;
}

.intro a {
  text-decoration: none;
  color: var(--p-primary-700);
}

.intro a:hover {
  text-decoration: underline;
  color: var(--p-primary-400);
}

.bright a {
  color: var(--p-primary-400);
}

.bright a:hover {
  color: var(--p-primary-300);
}

.example-row {
  display: inline-flex;
  gap: 0.5rem;
  padding-left: 0.5rem;
  flex-wrap: nowrap;
  align-items: center;
  --p-button-sm-font-size: 0.65rem;
  --p-button-sm-padding-x: 0.125rem;
  --p-button-sm-padding-y: 0.125rem;
  --p-button-border-radius: 3px;
}

.example-row > * {
  width: 1.5rem;
}

.list {
  margin: 0;
  padding-left: 0;
  list-style: none inside;
}

.list li {
  display: flex;
}

.list li::before {
  content: '■';
  font-size: 0.5rem;
  margin-right: 0.5rem;
}
</style>
