<script setup lang="ts">
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Toast from 'primevue/toast'
import FileDropZone from '@/components/FileDropZone.vue'
import ConfigPanel from '@/components/ConfigPanel.vue'
import HelpDialog from '@/components/HelpDialog.vue'
import ProgressPanel from '@/components/ProgressPanel.vue'
import SvgRenderer from '@/components/SvgRenderer.vue'
import TopResultsBar from '@/components/TopResultsBar.vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SvgAnimatedRenderer from '@/components/SvgAnimatedRenderer.vue'
import PatchInfo from '@/components/PatchInfo.vue'
import SvgPlaceholder from '@/components/SvgPlaceholder.vue'
import { useToast } from 'primevue/usetoast'
import { formatScore } from '@/utils/formatScore.ts'

const animateSvg = true
const store = useOptimizerStore()

const toast = useToast()

watch(
  () => store.status,
  (status) => {
    if (status === 'done') {
      const best = store.rnbo?.best
      const score = store.progress.bestScore
      let icon: string | null = null
      let deltaStr: string | null = null
      let delta: number | null = null
      let sign: number | null = null
      if (best != null && score != null) {
        if (Math.round(score) === best) {
          icon = 'pi-check'
        } else if (Math.round(score) < best) icon = 'pi-arrow-down'

        delta = Math.round(score) - best
        deltaStr = delta.toLocaleString()
        sign = Math.sign(delta)
      }

      toast.add({
        summary: 'Done',
        life: 2800,
        detail: { msg: formatScore(score), icon, delta, deltaStr, sign },
        severity: 'info',
      })
    }
  },
)

const hasEverRendered = ref(false)
watch(
  () => store.displayedLayouts.length,
  (len) => {
    if (len > 0) hasEverRendered.value = true
  },
)
const version = __APP_VERSION__
const helpVisible = ref(false)

function copyRnbo() {
  const data = store.getExportClipboard()
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

const isMac = navigator.platform.toUpperCase().includes('MAC')
const pasteKey = isMac ? '⌘V' : 'Ctrl+V'
const copyKey = isMac ? '⌘C' : 'Ctrl+C'

async function pasteFromClipboard() {
  const text = await navigator.clipboard.readText()
  store.loadFile(`{"patcher":${text}}`, 'clipboard.json', 'clipboard')
}

const optionDown = ref(false)
const pasteKeyDown = ref(false)
const copyKeyDown = ref(false)

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || (t as HTMLElement).isContentEditable
}

function onKeyDown(e: KeyboardEvent) {
  optionDown.value = e.altKey
  const mod = isMac ? e.metaKey : e.ctrlKey
  if (!isTyping(e) && e.code === 'KeyR' && !mod && !e.shiftKey) {
    e.preventDefault()
    if (!e.repeat) {
      if (btnStart.value) {
        if (e.altKey) {
          store.startReOptimization()
        } else {
          store.startOptimization()
        }
      } else {
        store.stopOptimization()
      }
    }
    return
  }
  if (!mod || e.altKey || e.shiftKey || isTyping(e)) return
  if (e.key === 'v') {
    e.preventDefault()
    if (!e.repeat) {
      pasteKeyDown.value = true
      pasteFromClipboard().finally(() => setTimeout(() => (pasteKeyDown.value = false), 300))
    }
  } else if (e.key === 'c' && store.canExport) {
    e.preventDefault()
    if (!e.repeat) {
      copyKeyDown.value = true
      setTimeout(() => (copyKeyDown.value = false), 300)
      copyRnbo()
    }
  }
}
function onKeyUp(e: KeyboardEvent) {
  optionDown.value = e.altKey

  const modKey = isMac ? 'Meta' : 'Control'
  if (e.key === 'v' || e.key === modKey) pasteKeyDown.value = false
  if (e.key === 'c' || e.key === modKey) copyKeyDown.value = false
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
          <FileDropZone :paste-active="pasteKeyDown" />
          <div class="action-row">
            <Button
              :label="btnStart ? (optionDown ? 'Re-run' : 'Run') : 'Stop'"
              size="small"
              :variant="btnStart ? (!store.canStart ? 'outlined' : undefined) : 'outlined'"
              :severity="btnStart ? (btnStart && !store.canStart ? 'secondary' : undefined) : 'secondary'"
              :disabled="btnStart && (!store.canStart || (optionDown && !store.top.length))"
              @click="btnStart ? (optionDown ? store.startReOptimization() : store.startOptimization()) : store.stopOptimization()" />
            <Button
              v-if="btnPauseResume"
              :label="btnPause ? 'Pause' : 'Resume'"
              variant="outlined"
              size="small"
              severity="secondary"
              @click="btnPause ? store.pauseOptimization() : store.resumeOptimization()" />
            <Button
              v-else
              style="visibility: hidden"
              variant="outlined"
              size="small"
              disabled />
            <Button
              :label="store.inputSource === 'clipboard' || optionDown || copyKeyDown ? 'Copy' : 'Download'"
              variant="outlined"
              :class="{ 'info-active': copyKeyDown }"
              size="small"
              :severity="!store.canExport ? 'secondary' : store.inputSource === 'clipboard' || optionDown || copyKeyDown ? 'info' : undefined"
              :disabled="!store.canExport"
              @click="store.inputSource === 'clipboard' || optionDown || copyKeyDown ? copyRnbo() : downloadRnbo()" />
          </div>
          <div class="section-divider"></div>
          <ProgressPanel />
          <div
            class="section-divider"
            style="margin-bottom: 0.5rem"></div>
          <ConfigPanel />
        </div>
        <Toolbar class="sidebar-toolbar">
          <template #start>
            <span class="sidebar-title">layout-maxing</span>
            <span class="sidebar-version">v{{ version }}</span>
          </template>
          <template #end>
            <a
              rounded
              class="gh-link"
              href="#"
              style="margin-right: 1rem"
              @click="
                (e) => {
                  e.preventDefault()
                  helpVisible = true
                  return false
                }
              "
              ><i class="pi svg-icon">
                <svg
                  width="16"
                  height="16"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24">
                  <path
                    d="M 11.999999,1e-7 C 5.3866667,1e-7 1.428571e-8,5.3866668 1.428571e-8,12 1.428571e-8,18.613333 5.3866667,24 11.999999,24 18.613333,24 24,18.613333 24,12 24,5.3866668 18.613333,1e-7 11.999999,1e-7 Z m 3.066668,6.2666666 c 0.813332,0.8133334 1.266666,1.9066667 1.266666,3.0666666 0,1.1599997 -0.453334,2.2399997 -1.266666,3.0666667 -0.573334,0.573333 -1.293334,0.973333 -2.066668,1.146667 v 0.453332 c 0,0.546668 -0.453332,1 -1,1 -0.546666,0 -1,-0.453332 -1,-1 v -1.333332 c 0,-0.546667 0.453334,-1 1,-1 0.626668,0 1.213334,-0.24 1.653334,-0.68 0.44,-0.44 0.68,-1.026667 0.68,-1.6533337 0,-0.6266666 -0.24,-1.2133333 -0.68,-1.6533333 -0.88,-0.8799999 -2.413334,-0.8799999 -3.293333,0 C 9.9199995,8.12 9.6799995,8.7066667 9.6799995,9.3333333 9.6799995,9.88 9.226667,10.333333 8.6799996,10.333333 8.1333333,10.333333 7.68,9.88 7.68,9.3333333 c 0,-1.1599999 0.4533333,-2.24 1.266667,-3.0666666 1.64,-1.64 4.493332,-1.64 6.133332,0 z M 13.333333,17.666667 C 13.333333,18.4 12.733333,19 11.999999,19 c -0.733332,0 -1.333332,-0.6 -1.333332,-1.333333 0,-0.733334 0.6,-1.333334 1.333332,-1.333334 0.733334,0 1.333334,0.6 1.333334,1.333334 z" />
                </svg> </i
            ></a>
            <a
              href="https://github.com/darosh/layout-maxing"
              target="_blank"
              rel="noopener"
              class="gh-link">
              <i class="pi pi-github" />
            </a>
          </template>
        </Toolbar>
      </aside>

      <section class="canvas-col">
        <div class="canvas">
          <SvgAnimatedRenderer
            v-if="animateSvg"
            @tap="store.showStats = !store.showStats" />
          <SvgRenderer v-else />
          <div
            v-if="hasEverRendered"
            class="canvas-overlay">
            <PatchInfo />
          </div>
        </div>
        <TopResultsBar />
        <div
          v-if="!hasEverRendered"
          class="canvas-placeholder">
          <SvgPlaceholder
            :paste-key="pasteKey"
            :copy-key="copyKey" />
        </div>
      </section>
    </main>
    <HelpDialog
      v-model:visible="helpVisible"
      :is-mac="isMac" />
    <Toast
      position="center"
      style="--p-toast-info-background: rgba(66, 66, 66, 0.4); --p-toast-info-border-color: rgba(88, 88, 88, 0.5); --p-toast-info-color: #fff">
      <template #container="{ message, closeCallback }">
        <section
          @click="closeCallback"
          class="rounded-sm"
          style="
            padding: 2rem;
            height: 8rem;
            text-align: center;
            font-family: monospace;
            font-size: 1.2rem;
            gap: 1rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          ">
          <div style="color: var(--p-primary-400)">{{ message.summary }}</div>
          <div class="result">
            {{ message.detail.msg
            }}<i
              v-if="message.detail.icon"
              :class="['pi', 'icon', message.detail.icon]" /><template v-if="message.detail.sign !== 0"
              ><span :class="message.detail.sign < 0 ? 'minus' : 'plus'">
                <template v-if="message.detail.sign > 0">+</template>{{ message.detail.deltaStr }}</span
              ></template
            >
          </div>
        </section>
      </template>
    </Toast>
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
  border-radius: 50%;
}

.gh-link:hover {
  color: var(--p-surface-100);
}

.gh-link:focus {
  outline: 1px solid var(--p-primary-400);
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
  position: relative;
}

.canvas {
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
}

.canvas-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.canvas-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas > * {
  flex: 1;
}

.info-active {
  background: var(--p-button-outlined-info-active-background);
}

.result {
  display: flex;
  align-content: space-between;
  justify-content: center;
}

.icon {
  font-size: 0.84rem;
  margin: 0 0 0 0.8rem;
  color: var(--p-primary-400);
  display: inline-block;
  position: relative;
  line-height: 1.4rem;
}

.minus {
  color: var(--p-primary-400);
  font-size: 1rem;
  margin-left: 1rem;
  line-height: 1.55rem;
}

.plus {
  color: var(--p-red-500);
  font-size: 1rem;
  margin-left: 1rem;
  line-height: 1.55rem;
}

.svg-icon {
  fill: currentColor;
  height: 16px;
}

.svg-icon:before {
  content: '';
}
</style>
