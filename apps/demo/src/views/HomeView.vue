<script setup lang="ts">
import Button from 'primevue/button'
import FileDropZone from '@/components/FileDropZone.vue'
import ConfigPanel from '@/components/ConfigPanel.vue'
import ProgressPanel from '@/components/ProgressPanel.vue'
import SvgRenderer from '@/components/SvgRenderer.vue'
import TopResultsBar from '@/components/TopResultsBar.vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { computed } from 'vue'

const store = useOptimizerStore()

function copyRnbo() {
  const data = store.getExportRnbo()
  if (data) navigator.clipboard.writeText(JSON.stringify(data))
}

function downloadRnbo() {
  const data = store.getExportRnbo()
  if (!data) return
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = store.fileName
  a.click()
  URL.revokeObjectURL(url)
}

const btnStart = computed(() => store.status !== 'running' && store.status !== 'paused')
const btnPauseResume = computed(() => store.status === 'running' || store.status === 'paused')
const btnResume = computed(() => store.status === 'paused')
const btnPause = computed(() => store.status === 'running')
</script>

<template>
  <div class="home">
    <main class="app-body">
      <aside class="sidebar">
        <FileDropZone />
        <div class="action-row">
          <Button
            :label="btnStart ? 'Optimize' : 'Stop'"
            size="small"
            :variant="btnStart ? undefined : 'outlined'"
            :severity="
              btnStart ? (btnStart && !store.canStart ? 'secondary' : undefined) : 'secondary'
            "
            :disabled="btnStart && !store.canStart"
            @click="btnStart ? store.startOptimization() : store.stopOptimization()"
          />
          <Button
            v-if="btnPauseResume"
            :label="btnPause ? 'Pause' : 'Resume'"
            variant="outlined"
            size="small"
            severity="secondary"
            @click="btnPause ? store.pauseOptimization() : store.resumeOptimization()"
          />
          <Button v-else style="visibility: hidden" variant="outlined" size="small" disabled />
          <Button
            v-if="store.inputSource === 'clipboard'"
            label="Copy"
            variant="outlined"
            size="small"
            :severity="!store.canExport ? 'secondary' : 'info'"
            :disabled="!store.canExport"
            @click="copyRnbo()"
          />
          <Button
            v-else
            label="Download"
            variant="outlined"
            size="small"
            :severity="!store.canExport ? 'secondary' : undefined"
            :disabled="!store.canExport"
            @click="downloadRnbo()"
          />
        </div>
        <div class="section-divider"></div>
        <ProgressPanel />
        <div class="section-divider" style="margin-bottom: 0.5rem"></div>
        <ConfigPanel />
      </aside>

      <section class="canvas-col">
        <div class="canvas">
          <SvgRenderer />
        </div>
        <TopResultsBar />
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--p-surface-950);
  color: var(--p-surface-100);
}

.home:deep(*) {
  --p-button-transition-duration: 0;
  --p-form-field-transition-duration: 0;
}

.app-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--p-surface-800);
  flex-shrink: 0;
}

.app-title {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--p-primary-300);
  margin: 0;
}

.app-subtitle {
  font-size: 0.8rem;
  color: var(--p-surface-500);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  min-width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
  background: var(--p-surface-900);
  border-right: 1px solid var(--p-surface-800);
}

.section-divider {
  height: 1px;
  flex-shrink: 0;
  margin: 1.25rem -1rem 1rem -1rem;
  background: var(--p-surface-700);
}

.action-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-row :deep(.p-button) {
  width: 100%;
}

.status-done {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--p-green-400);
}

.status-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--p-red-400);
  word-break: break-word;
}

/* Right-hand column: SVG canvas + top-5 bar stacked vertically */
.canvas-col {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.canvas {
  flex: 1;
  overflow: hidden;
  padding: 0.75rem;
  display: flex;
}

.canvas > * {
  flex: 1;
}
</style>
