<script setup lang="ts">
import { ref, nextTick } from 'vue'

const tooltipEl = ref<HTMLElement | null>(null)
const tooltipText = ref('')
const tooltipLeft = ref(0)
const tooltipTop = ref(0)
const tooltipVisible = ref(false)
const tooltipMoving = ref(false)
const tooltipPosition = ref<'top' | 'right'>('top')

let hideTimer: ReturnType<typeof setTimeout> | null = null

async function show(e: Event, text: string, position: 'top' | 'right' = 'top') {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  tooltipMoving.value = tooltipVisible.value
  tooltipPosition.value = position
  tooltipText.value = text
  tooltipVisible.value = true

  if (position === 'right') {
    tooltipLeft.value = rect.right
    tooltipTop.value = rect.top + rect.height / 2

    await nextTick()
    if (tooltipEl.value) {
      const tip = tooltipEl.value.getBoundingClientRect()
      const margin = 8
      const minTop = margin + tip.height / 2
      const maxTop = window.innerHeight - margin - tip.height / 2
      tooltipTop.value = Math.min(Math.max(tooltipTop.value, minTop), maxTop)
    }
  } else {
    tooltipLeft.value = rect.left + rect.width / 2
    tooltipTop.value = rect.top

    await nextTick()
    if (tooltipEl.value) {
      const tip = tooltipEl.value.getBoundingClientRect()
      const margin = 8
      const minLeft = margin + tip.width / 2
      const maxLeft = window.innerWidth - margin - tip.width / 2
      tooltipLeft.value = Math.min(Math.max(tooltipLeft.value, minLeft), maxLeft)
    }
  }
}

function hide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
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
      ref="tooltipEl"
      class="flying-tooltip"
      :class="{
        visible: tooltipVisible,
        moving: tooltipMoving,
        'position-right': tooltipPosition === 'right',
      }"
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
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  z-index: 9999;
  transition: opacity 0.1s;
}

.flying-tooltip.position-right {
  transform: translate(6px, -50%);
}

.flying-tooltip.moving {
  transition:
    left 0.15s ease,
    top 0.15s ease,
    opacity 0.1s;
}

.flying-tooltip.visible {
  opacity: 1;
}
</style>
