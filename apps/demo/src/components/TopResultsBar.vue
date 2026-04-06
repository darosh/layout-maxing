<script setup lang="ts">
import { computed } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'
import type { Selection } from '@/stores/optimizer'
import { formatScore } from '@/utils/formatScore.ts'

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

const displaySet = computed(() => (store.allTimeTop ? store.top : store.currentGenTop))
let o: string
</script>

<template>
  <div v-if="store.originalSvg || store.top.length" class="top-results-bar">
    <!-- Original layout -->
    <button
      v-if="store.originalSvg"
      class="thumb-btn"
      :class="{ active: isActive({ kind: 'original' }) }"
      :title="
        store.originalFitness
          ? `Original · Score: ${store.originalFitness.score.toFixed(0)}`
          : 'Original layout'
      "
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
      :title="`All-time best · Score: ${store.top[0]!.score.toFixed(0)}`"
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
        :class="{ active: isActive({ kind: 'allTime', index: i }) }"
        :title="`#${i + 1} · Score: ${entry.score.toFixed(0)}`"
        @click="store.selection = { kind: 'allTime', index: i }"
      >
        <div class="thumb-svg" v-html="entry.svg" />
        <span class="thumb-label">#{{ i + 1 }}</span>
        <span class="thumb-score">{{ formatScore(entry.score) }}</span>
      </button>
    </template>
    <template v-else>
      <button
        v-for="(entry, i) in displaySet"
        :key="i"
        class="thumb-btn"
        :class="{ active: isActive({ kind: 'current', index: i }) }"
        :title="`${ordinal(i + 1)} · Score: ${entry.score.toFixed(0)}`"
        @click="store.selection = { kind: 'current', index: i }"
      >
        <div class="thumb-svg" v-html="entry.svg" />
        <span class="thumb-label">{{void(o = ordinal(i + 1))}}{{ o.slice(0, o.length - 2) }}<span class="thumb-label-ordinal">{{o.slice(o.length - 2)}}</span>
        </span>
        <span class="thumb-score">{{ formatScore(entry.score) }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.top-results-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
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
  border-radius: 6px;
  background: none;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  flex-shrink: 0;
  opacity: 0.5;
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.thumb-btn:hover {
  opacity: 0.85;
  transform: translateY(-2px);
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
