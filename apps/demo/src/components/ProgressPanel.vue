<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'
import { useOptimizerStore } from '@/stores/optimizer'
import { formatScore } from '@/utils/formatScore.ts'
import { watch } from 'vue'

const store = useOptimizerStore()

function formatMs(ms: number | null): string {
  if (ms === null || !isFinite(ms) || ms < 0) return '--:--'
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatElapsed(ms: number): string {
  return formatMs(ms)
}

let idle = true

watch(
  () => store.status,
  () => (idle = false),
)
</script>

<template>
  <div class="progress-panel" :class="{ idle: idle }">
    <div class="stats-row">
      <div class="stat">
        <span class="stat-label"
          ><template v-if="store.progress.numPasses > 1">Pass / Gen</template
          ><template v-else>Generation</template></span
        >
        <span class="stat-value"
          ><template v-if="store.progress.numPasses > 1"
            >{{ store.progress.passNum.toLocaleString()
            }}<span style="margin: 0 0.2rem; opacity: 0.5">/</span
            >{{ store.progress.generation.toLocaleString() }}</template
          ><template v-else>{{ store.progress.generation.toLocaleString() }}</template></span
        >
      </div>
      <div class="stat">
        <span class="stat-label">Stop In</span>
        <span class="stat-value">{{ store.progress.stopIn.toLocaleString() }}</span>
        <ProgressBar
          :value="Math.round((store.progress.stopIn / store.config.stop!) * 1000) / 10"
          :show-value="false"
          class="progress-bar progress-bar-small" />
      </div>
      <div class="stat">
        <span class="stat-label">Best</span>
        <span class="stat-value"
          >{{ formatScore(store.progress.bestScore)
          }}<template v-if="store.rnbo?.best != null && store.progress.bestScore != null"
            ><i
              v-if="Math.round(store.progress.bestScore) === store.rnbo.best"
              class="pi pi-check" /><i
              v-else-if="Math.round(store.progress.bestScore) < store.rnbo.best"
              class="pi pi-arrow-down" /></template
        ></span>
      </div>
      <div class="stat">
        <span class="stat-label">Gen 1st</span>
        <span class="stat-value">{{ formatScore(store.progress.gen1stScore) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Gen 2nd</span>
        <span class="stat-value">{{ formatScore(store.progress.gen2ndScore) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Gen Last</span>
        <span class="stat-value">{{ formatScore(store.progress.genLastScore) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Elapsed</span>
        <span class="stat-value">{{ formatElapsed(store.progress.elapsed) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">ETA</span>
        <span class="stat-value">{{ formatMs(store.eta) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Status</span>
        <span
          class="stat-value status"
          :class="{ done: store.status === 'done' }"
          style="text-transform: capitalize"
          >{{ store.status }}</span
        >
      </div>
    </div>
    <ProgressBar
      :value="Math.round(store.progressPercent * 10) / 10"
      :show-value="false"
      class="progress-bar" />
  </div>
</template>

<style scoped>
.progress-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar:deep(.p-progressbar-value) {
  transition: none;
}

.progress-bar {
  height: 6px;
  border-radius: 3px;
}

.progress-bar-small {
  height: 2px;
  border-radius: 1px;
  margin-bottom: -5px;
  margin-top: 3px;
  margin-right: 6px;
  --p-progressbar-value-background: var(--p-surface-300);
}

.stats-row {
  display: inline-flex;
  row-gap: 1rem;
  column-gap: 5%;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  width: calc(30%);
  flex-direction: column;
  gap: 0.1rem;
  align-content: space-between;
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-surface-500);
}

.stat-value {
  font-size: 0.875rem;
  font-family: monospace;
  color: var(--p-surface-200);
}

.stat-value .pi {
  font-size: 0.7rem;
  margin: 0 0.5rem 0 0.5rem;
  color: var(--p-primary-400);
  display: inline-block;
  position: relative;
  top: -1px;
}

.stat-value.done {
  color: var(--p-primary-400);
}

.progress-panel.idle .stat-value:not(.status),
.progress-panel.idle .progress-bar {
  opacity: 0.4;
}
</style>
