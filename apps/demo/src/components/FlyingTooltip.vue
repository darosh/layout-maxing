<script setup lang="ts">
import { reactive, ref, watchEffect, nextTick } from 'vue'

const props = defineProps<{ maxWidth?: number }>()

const tooltipEl = ref<HTMLElement | null>(null)

const state = reactive({
  text: '',
  left: 0,
  top: 0,
  visible: false,
  moving: false,
  position: 'top' as 'top' | 'right',
})

const textGetter = ref<(() => string) | null>(null)
watchEffect(() => {
  if (textGetter.value) state.text = textGetter.value()
})

let hideTimer: ReturnType<typeof setTimeout> | null = null

async function show(e: Event, text: string | (() => string), position: 'top' | 'right' = 'top') {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  state.moving = state.visible
  state.position = position
  textGetter.value = typeof text === 'function' ? text : null
  state.text = typeof text === 'function' ? text() : text
  state.visible = true

  if (position === 'right') {
    state.left = rect.right
    state.top = rect.top + rect.height / 2

    await nextTick()
    if (tooltipEl.value) {
      const tip = tooltipEl.value.getBoundingClientRect()
      const margin = 8
      const minTop = margin + tip.height / 2
      const maxTop = window.innerHeight - margin - tip.height / 2
      state.top = Math.min(Math.max(state.top, minTop), maxTop)
    }
  } else {
    const targetLeft = rect.left + rect.width / 2
    // When first showing (no animation), pre-position at viewport center so the browser
    // renders the tooltip at its natural width before we measure and clamp.
    // When moving (transition active), skip the pre-position to avoid a slide-from-center glitch.
    state.left = state.moving ? targetLeft : window.innerWidth / 2
    state.top = rect.top

    await nextTick()
    if (tooltipEl.value) {
      const tip = tooltipEl.value.getBoundingClientRect()
      const margin = 8
      const minLeft = margin + tip.width / 2
      const maxLeft = window.innerWidth - margin - tip.width / 2
      state.left = Math.min(Math.max(targetLeft, minLeft), maxLeft)
    }
  }
}

function hide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  hideTimer = setTimeout(() => {
    state.visible = false
    state.moving = false
    textGetter.value = null
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
        visible: state.visible,
        moving: state.moving,
        'position-right': state.position === 'right',
      }"
      :style="{
        left: state.left + 'px',
        top: state.top + 'px',
        width: props.maxWidth ? props.maxWidth + 'px' : undefined,
        whiteSpace: props.maxWidth ? 'normal' : undefined,
      }"
      v-html="state.text.replace(/\n/g, '<br>')"
    />
  </Teleport>
</template>

<style>
/* teleported — cannot use scoped */
.flying-tooltip {
  position: fixed;
  transform: translate(-50%, calc(-100% - 6px));
  background: var(--p-surface-800);
  color: var(--p-surface-300);
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
