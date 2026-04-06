<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { formatFullScore, formatScore as fmt } from '../utils/formatScore'
import { BEST_LABEL, INPUT_LABEL } from '@/utils/consts.ts'
import FlyingTooltip from './FlyingTooltip.vue'
import { fitnessMeta } from 'layout-maxing'

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
  if (sel.kind === 'live') return null
  if (sel.kind === 'original') return INPUT_LABEL
  if (sel.kind === 'best') return BEST_LABEL
  if (sel.kind === 'allTime') return `#${sel.index + 1}`
  if (sel.kind === 'current') return ordinal(sel.index + 1)
  return null
})

const fullScore = computed(() => {
  return formatFullScore(store.displayedFitness?.score)
})
</script>

<template>
  <FlyingTooltip ref="tooltip" />
  <div class="svg-renderer">
    <div v-if="!store.displayedSvg" class="placeholder">
      <i class="pi pi-objects-column placeholder-icon" />
      <span>Preview will appear here during optimization</span>
    </div>

    <template v-else>
      <!-- SVG canvas: key change triggers the brief fade-in CSS animation -->
      <div class="svg-canvas" :key="store.displayedSvg" v-html="store.displayedSvg" />

      <!-- Bottom-left: score + selection label -->
      <div class="overlay overlay-bl">
        <span class="score-value">{{ fmt(store.displayedFitness?.score) }}</span>
        <span class="score-value selection-label">{{ fullScore }}</span>
      </div>

      <div class="overlay overlay-tl">
        <span v-if="selectionLabel" class="selection-label">
          <template v-if="store.selection.kind === 'current'">
            {{ selectionLabel.slice(0, selectionLabel.length - 2)
            }}<span class="selection-label-ordinal">{{
              selectionLabel.slice(selectionLabel.length - 2)
            }}</span>
          </template>
          <template v-else>{{ selectionLabel }}</template>
        </span>
      </div>

      <!-- Bottom-right: detail metrics -->
      <div class="overlay overlay-br">
        <!--        <span class="metric metric-interactive"><span class="metric-label">len</span>{{ fmt(store.displayedFitness?.length) }}</span>-->
        <span class="metric metric-interactive"
          @mouseenter="tooltip?.show($event, fitnessTooltip('collisions'))"
          @mouseleave="tooltip?.hide()"
          ><span class="metric-label">col</span>{{ fmt(store.displayedFitness?.collisions) }}</span
        >
        <span class="metric metric-interactive"
          @mouseenter="tooltip?.show($event, fitnessTooltip('overlaps'))"
          @mouseleave="tooltip?.hide()"
          ><span class="metric-label">ove</span>{{ fmt(store.displayedFitness?.overlaps) }}</span
        >
        <span class="metric metric-interactive"
          @mouseenter="tooltip?.show($event, fitnessTooltip('crossings'))"
          @mouseleave="tooltip?.hide()"
          ><span class="metric-label">cro</span>{{ fmt(store.displayedFitness?.crossings) }}</span
        >
        <span class="metric metric-interactive"
          @mouseenter="tooltip?.show($event, fitnessTooltip('area'))"
          @mouseleave="tooltip?.hide()"
          ><span class="metric-label">are</span>{{ fmt(store.displayedFitness?.area) }}</span
        >
      </div>
    </template>
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

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--p-surface-600);
  font-size: 0.875rem;
}

.placeholder-icon {
  font-size: 2.5rem;
}

.svg-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.svg-canvas :deep(svg) {
  width: 100%;
  height: 100%;
}

/* Overlays */
.overlay {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
}

.overlay-bl {
  bottom: 0.5rem;
  left: 0.5rem;
  gap: 1rem;
}

.overlay-tl {
  top: 0.5rem;
  left: 0.5rem;
  gap: 0.6rem;
}

.overlay-br {
  bottom: 0.5rem;
  right: 0.5rem;
  gap: 0.6rem;
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
