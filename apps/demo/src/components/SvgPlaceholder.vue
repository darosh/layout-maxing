<script setup lang="ts">
import IntroSection from '@/components/IntroSection.vue'

defineProps<{
  pasteKey?: string
  copyKey?: string
}>()
</script>

<template>
  <div class="placeholder">
    <IntroSection :paste-key="pasteKey" />
  </div>
</template>

<style scoped>
.placeholder {
  padding: 1rem;
  max-width: 520px;
}
</style>
