<script setup lang="ts">
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import FileDropZone from '@/components/FileDropZone.vue'
import ConfigPanel from '@/components/ConfigPanel.vue'
import HelpDialog from '@/components/HelpDialog.vue'
import ProgressPanel from '@/components/ProgressPanel.vue'
import SvgRenderer from '@/components/SvgRenderer.vue'
import TopResultsBar from '@/components/TopResultsBar.vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const store = useOptimizerStore()
const version = __APP_VERSION__
const helpVisible = ref(false)

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

const shiftDown = ref(false)
function onKeyDown(e: KeyboardEvent) {
  shiftDown.value = e.altKey
}
function onKeyUp(e: KeyboardEvent) {
  shiftDown.value = e.altKey
}
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

const btnStart = computed(() => store.status !== 'running' && store.status !== 'paused')
const btnPauseResume = computed(() => store.status === 'running' || store.status === 'paused')
const btnResume = computed(() => store.status === 'paused')
const btnPause = computed(() => store.status === 'running')
</script>

<template>
  <div class="home">
    <main class="app-body">
      <aside class="sidebar">
        <div class="sidebar-scroll">
          <FileDropZone />
          <div class="action-row">
            <Button
              :label="btnStart ? (shiftDown ? 'Re-run' : 'Optimize') : 'Stop'"
              size="small"
              :variant="btnStart ? (!store.canStart ? 'outlined' : undefined) : 'outlined'"
              :severity="
                btnStart ? (btnStart && !store.canStart ? 'secondary' : undefined) : 'secondary'
              "
              :disabled="btnStart && (!store.canStart || (shiftDown && !store.top.length))"
              @click="
                btnStart
                  ? shiftDown
                    ? store.startReOptimization()
                    : store.startOptimization()
                  : store.stopOptimization()
              "
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
              :label="store.inputSource === 'clipboard' || shiftDown ? 'Copy' : 'Download'"
              variant="outlined"
              size="small"
              :severity="!store.canExport ? 'secondary' : (store.inputSource === 'clipboard' || shiftDown ? 'info' : undefined)"
              :disabled="!store.canExport"
              @click="store.inputSource === 'clipboard' || shiftDown ? copyRnbo() : downloadRnbo()"
            />
          </div>
          <div class="section-divider"></div>
          <ProgressPanel />
          <div class="section-divider" style="margin-bottom: 0.5rem"></div>
          <ConfigPanel />
        </div>
        <Toolbar class="sidebar-toolbar">
          <template #start>
            <span class="sidebar-title">layout-maxing</span>
            <span class="sidebar-version">v{{ version }}</span>
          </template>
          <template #end>
            <a rounded class="gh-link" style="margin-right: 1rem" @click="helpVisible = true">
              <i class="pi pi-question-circle" />
            </a>
            <a
              href="https://github.com/darosh/layout-maxing"
              target="_blank"
              rel="noopener"
              class="gh-link"
            >
              <i class="pi pi-github" />
            </a>
          </template>
        </Toolbar>
      </aside>

      <section class="canvas-col">
        <div class="canvas">
          <SvgRenderer />
        </div>
        <TopResultsBar />
      </section>
    </main>
    <HelpDialog v-model:visible="helpVisible" />
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
  background: var(--p-surface-900);
  border-right: 1px solid var(--p-surface-800);
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.sidebar-toolbar {
  flex-shrink: 0;
  border-radius: 0;
  border-top: 1px solid var(--p-surface-700);
  border-bottom: none;
  border-left: none;
  border-right: none;
  background: var(--p-surface-900);
  padding: 1rem 1rem;
}

.sidebar-title {
  font-family: monospace;
  color: var(--p-surface-400);
}

.sidebar-version {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--p-surface-500);
  margin-left: 1rem;
}

.gh-link {
  color: var(--p-surface-500);
  font-size: 1.15rem;
  line-height: 1;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.gh-link:hover {
  color: var(--p-surface-100);
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
