<script setup lang="ts">
import { computed } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'

const store = useOptimizerStore()

const selectionKey = computed(() => {
  const sel = store.selection
  if (sel.kind === 'original') return 'original'
  if (sel.kind === 'allTime') return `allTime-${sel.index}`
  if (sel.kind === 'current') return `current-${sel.index}`
  return 'unknown'
})

const clusterCss = computed(() => {
  const total = store.clusteringInfo?.totalClusters ?? 0
  if (!total) return ''
  const lines: string[] = []
  for (let i = 0; i < total; i++) {
    const hue = (i * 137.508) % 360
    const color = `hsl(${hue}deg 65% 55%)`
    lines.push(`.svg-canvas [data-cluster="${i}"] { stroke: ${color} !important; fill: ${color} !important; }`)
  }
  const active = store.progress.clusterIndex
  if (active != null) {
    lines.push('.svg-canvas [data-cluster] { opacity: 0.2; }')
    lines.push(`.svg-canvas [data-cluster="${active}"] { opacity: 1; }`)
  }
  return lines.join('\n')
})
</script>

<template>
  <div class="svg-renderer">
    <component
      :is="'style'"
      v-if="clusterCss"
      >{{ clusterCss }}</component
    >
    <div
      v-if="store.displayedSvg"
      class="svg-canvas"
      :key="selectionKey"
      v-html="store.displayedSvg" />
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

.svg-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.svg-canvas :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
