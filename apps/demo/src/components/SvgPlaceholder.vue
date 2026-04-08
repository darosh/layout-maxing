<script setup lang="ts">
const version = __APP_VERSION__

</script>

<template>
  <div class="placeholder">
    <div class="header">layout-maxing v{{version}}</div>
    <div>
    Select or drop a Max patch in the top left area<br/>
    Or paste a patch from clipboard<br/>
    Or select an example<br/>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.7rem;
  color: var(--p-surface-600);
  font-size: 1rem;
  padding-top: 80px;
  line-height: 1.4rem;
}

.header {
  color: var(--p-surface-400);
  font-size: 1rem;
}
</style>
