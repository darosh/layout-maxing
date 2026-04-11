<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { formatFullScore, formatScore as fmt } from '../utils/formatScore'
import { BEST_LABEL, CURRENT_LABEL, INPUT_LABEL } from '@/utils/consts.ts'
import FlyingTooltip from './FlyingTooltip.vue'
import { fitnessMeta } from 'layout-maxing'
import GenerationChart from '@/components/GenerationChart.vue'
import MutationStats from '@/components/MutationStats.vue'

const store = useOptimizerStore()
const tooltip = ref<InstanceType<typeof FlyingTooltip> | null>(null)

function fitnessTooltip(key: keyof typeof fitnessMeta): string {
  const [label, shortcut, description] = fitnessMeta[key]
  return `${shortcut}: ${label}\n${description}`
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0]!)
}

const selectionLabel = computed(() => {
  const sel = store.selection
  if (sel.kind === 'original') return INPUT_LABEL
  if (sel.kind === 'allTime') return `#${sel.index + 1}`
  if (sel.kind === 'current') return ordinal(sel.index + 1)
  return null
})

const fullScore = computed(() => {
  return formatFullScore(store.displayedFitness?.score)
})
</script>

<template>
  <FlyingTooltip ref="tooltip" :max-width="240" />
  <div class="svg-renderer">
    <!-- Bottom-left: score + selection label -->
    <div class="overlay overlay-bl">
      <span class="score-value">{{ fmt(store.displayedFitness?.score) }}</span>
      <span class="score-value selection-label">{{ fullScore }}</span>
    </div>

    <div class="overlay overlay-tl">
      <span v-if="selectionLabel" class="selection-label">
        <template v-if="store.selection.kind === 'current'">
          <template v-if="store.selection?.index === 0">{{ CURRENT_LABEL }}</template>
          {{ selectionLabel.slice(0, selectionLabel.length - 2)
          }}<span class="selection-label-ordinal">{{
            selectionLabel.slice(selectionLabel.length - 2)
          }}</span>
        </template>
        <template v-else-if="store.selection.kind === 'allTime'">
          <template v-if="store.selection?.index === 0">{{ BEST_LABEL }}</template>
          {{ selectionLabel }}</template
        >
        <template v-else>{{ INPUT_LABEL }}</template>
      </span>
    </div>

    <div style="position: absolute; right: 0.25rem; top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end">
      <GenerationChart :snapshots="store.snapshots" />
      <MutationStats :snapshots="store.snapshots" :run-monitor="store.runMonitor" :selected-entry="store.displayedEntry" />
    </div>

    <!-- Bottom-right: detail metrics -->
    <div class="overlay overlay-br">
      <!--        <span class="metric metric-interactive"><span class="metric-label">len</span>{{ fmt(store.displayedFitness?.length) }}</span>-->
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('collisions'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">col</span>{{ fmt(store.displayedFitness?.collisions) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('singleSelfCollisions'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">ssc</span
        >{{ fmt(store.displayedFitness?.singleSelfCollisions) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('misalignedSS'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">mss</span>{{ fmt(store.displayedFitness?.misalignedSS) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('overlaps'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">ove</span>{{ fmt(store.displayedFitness?.overlaps) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('crossings'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">cro</span>{{ fmt(store.displayedFitness?.crossings) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('area'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">are</span>{{ fmt(store.displayedFitness?.area) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('minDist'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">dst</span>{{ fmt(store.displayedFitness?.minDist) }}</span
      >
      <span
        class="metric metric-interactive"
        @mouseenter="tooltip?.show($event, fitnessTooltip('misalignedFirst'))"
        @mouseleave="tooltip?.hide()"
        ><span class="metric-label">mst</span
        >{{ fmt(store.displayedFitness?.misalignedFirst) }}</span
      >
    </div>
  </div>
</template>

<style scoped>
.svg-renderer {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Overlays */
.overlay {
  position: absolute;
  z-index: 2;
  user-select: none;
  display: flex;
  align-items: baseline;
}

.overlay-bl {
  bottom: 1.25rem;
  left: 1.25rem;
  gap: 1rem;
}

.overlay-tl {
  top: 1.25rem;
  left: 1.25rem;
  gap: 0.6rem;
}

.overlay-br {
  bottom: 1.25rem;
  right: 1.25rem;
  gap: 0.75rem;
}

.score-value {
  font-size: 0.85rem;
  font-family: monospace;
  color: var(--p-surface-200);
  opacity: 0.7;
  line-height: 1;
}

.selection-label {
  font-size: 0.85rem;
  font-family: monospace;
  color: var(--p-surface-400);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.selection-label-ordinal {
  font-size: 0.75em;
  vertical-align: text-top;
  line-height: 1.4;
  display: inline-flex;
  margin-left: 0.3em;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--p-surface-200);
  opacity: 0.7;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-surface-400);
}

.metric-interactive {
  pointer-events: auto;
  cursor: default;
}
</style>
