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
</script>

<template>
  <div class="svg-renderer">
    <div
      v-if="store.displayedSvg"
      class="svg-canvas"
      :key="selectionKey"
      v-html="store.displayedSvg"
    />
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
