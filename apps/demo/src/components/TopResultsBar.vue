<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'
import type { Selection } from '@/stores/optimizer'
import { formatFullScore, formatScore } from '@/utils/formatScore.ts'
import FlyingTooltip from './FlyingTooltip.vue'

const store = useOptimizerStore()

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0]!)
}

function isActive(sel: Selection): boolean {
  const cur = store.selection
  if (cur.kind !== sel.kind) return false
  if (sel.kind === 'allTime' && cur.kind === 'allTime') return cur.index === sel.index
  if (sel.kind === 'current' && cur.kind === 'current') return cur.index === sel.index
  return true
}

const displaySet = computed(() => (store.allTimeTop ? store.top.slice(1) : store.currentGenTop))
let o: string

const barRef = ref<HTMLElement | null>(null)
const tooltip = ref<InstanceType<typeof FlyingTooltip> | null>(null)
</script>

<template>
  <FlyingTooltip ref="tooltip" />
  <div v-if="store.originalSvg || store.top.length" ref="barRef" class="top-results-bar">
    <!-- Original layout -->
    <button
      v-if="store.originalSvg"
      class="thumb-btn"
      :class="{ active: isActive({ kind: 'original' }) }"
      @mouseenter="
        tooltip?.show(
          $event,
          store.originalFitness
            ? `Original input\nScore: ${formatFullScore(store.originalFitness.score)}`
            : 'Original input',
        )
      "
      @mouseleave="tooltip?.hide()"
      @click="store.selection = { kind: 'original' }"
    >
      <div class="thumb-svg" v-html="store.originalSvg" />
      <span class="thumb-label">Input</span>
      <span v-if="store.originalFitness" class="thumb-score">
        {{ formatScore(store.originalFitness.score) }}
      </span>
    </button>

    <!-- All-time best (always visible) -->
    <button
      v-if="store.top.length"
      class="thumb-btn"
      :class="{ active: isActive({ kind: 'best' }) }"
      @mouseenter="
        tooltip?.show($event, `All-time best\nScore: ${formatFullScore(store.top[0]!.score)}`)
      "
      @mouseleave="tooltip?.hide()"
      @click="store.selection = { kind: 'best' }"
    >
      <div class="thumb-svg" v-html="store.top[0]!.svg" />
      <span class="thumb-label">Best</span>
      <span class="thumb-score">{{ formatScore(store.top[0]!.score) }}</span>
    </button>

    <!-- Selected set: all-time (#1, #2…) or current gen (1st, 2nd…) -->
    <template v-if="store.allTimeTop">
      <button
        v-for="(entry, i) in displaySet"
        :key="i"
        class="thumb-btn"
        :class="{ active: isActive({ kind: 'allTime', index: i + 1 }) }"
        @mouseenter="tooltip?.show($event, `Top #${i + 2}\nScore: ${formatFullScore(entry.score)}`)"
        @mouseleave="tooltip?.hide()"
        @click="store.selection = { kind: 'allTime', index: i + 1 }"
      >
        <div class="thumb-svg" v-html="entry.svg" />
        <span class="thumb-label">#{{ i + 2 }}</span>
        <span class="thumb-score">{{ formatScore(entry.score) }}</span>
      </button>
    </template>
    <template v-else>
      <button
        v-for="(entry, i) in displaySet"
        :key="i"
        class="thumb-btn"
        :class="{ active: isActive({ kind: 'current', index: i }) }"
        @mouseenter="
          tooltip?.show($event, `Current ${ordinal(i + 1)}\nScore: ${formatFullScore(entry.score)}`)
        "
        @mouseleave="tooltip?.hide()"
        @click="store.selection = { kind: 'current', index: i }"
      >
        <div class="thumb-svg" v-html="entry.svg" />
        <span class="thumb-label"
          >{{ void (o = ordinal(i + 1)) }}{{ o.slice(0, o.length - 2)
          }}<span class="thumb-label-ordinal">{{ o.slice(o.length - 2) }}</span>
        </span>
        <span class="thumb-score">{{ formatScore(entry.score) }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.top-results-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem 0.75rem 0.75rem;
  border-top: 1px solid var(--p-surface-800);
  background: var(--p-surface-950);
  flex-shrink: 0;
  overflow-x: auto;
}

.thumb-btn {
  position: relative;
  width: 120px;
  height: 80px;
  border: none;
  border-radius: 3px;
  background: none;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  flex-shrink: 0;
  opacity: 0.5;
  transition:
    opacity 0s,
    transform 0.1s ease-in-out;
}

.thumb-btn:focus {
  /*outline: 1px solid var(--p-surface-500);*/
  outline: none;
}

.thumb-btn:hover,
.thumb-btn:focus {
  opacity: 0.85;
  transform: translateY(-2px);
}

.thumb-btn:active {
  opacity: 1;
  transform: translateY(4px);
}

.thumb-btn.active {
  opacity: 1;
}

.thumb-svg {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.thumb-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.thumb-score {
  position: absolute;
  left: 0.5rem;
  bottom: 0;
  font-size: 0.85rem;
  font-family: monospace;
  color: var(--p-surface-200);
  opacity: 0.7;
  text-align: center;
  padding: 1px 4px;
}

.thumb-label {
  position: absolute;
  left: 0.7rem;
  top: 0.25rem;
  font-size: 0.7rem;
  font-family: monospace;
  color: var(--p-surface-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.thumb-label-ordinal {
  font-size: 0.75em;
  vertical-align: text-top;
  line-height: 1.4;
  display: inline-flex;
  margin-left: 0.3em;
}
</style>
