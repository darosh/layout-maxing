<script setup lang="ts">
import { ref } from 'vue'

const tooltipText = ref('')
const tooltipLeft = ref(0)
const tooltipTop = ref(0)
const tooltipVisible = ref(false)
const tooltipMoving = ref(false)

let hideTimer: ReturnType<typeof setTimeout> | null = null

function show(e: MouseEvent, text: string) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  tooltipMoving.value = tooltipVisible.value
  tooltipLeft.value = rect.left + rect.width / 2
  tooltipTop.value = rect.top
  tooltipText.value = text
  tooltipVisible.value = true
}

function hide() {
  hideTimer = setTimeout(() => {
    tooltipVisible.value = false
    tooltipMoving.value = false
    hideTimer = null
  }, 200)
}

defineExpose({ show, hide })
</script>

<template>
  <Teleport to="body">
    <div
      class="flying-tooltip"
      :class="{ visible: tooltipVisible, moving: tooltipMoving }"
      :style="{ left: tooltipLeft + 'px', top: tooltipTop + 'px' }"
      v-html="tooltipText.replace(/\n/g, '<br>')"
    />
  </Teleport>
</template>

<style>
/* teleported — cannot use scoped */
.flying-tooltip {
  position: fixed;
  transform: translate(-50%, calc(-100% - 6px));
  background: var(--p-surface-700);
  color: var(--p-surface-0);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  z-index: 9999;
  transition: opacity 0.1s;
}

.flying-tooltip.moving {
  transition: left 0.15s ease, opacity 0.1s;
}

.flying-tooltip.visible {
  opacity: 1;
}
</style>
