<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import { useOptimizerStore } from '@/stores/optimizer'

const store = useOptimizerStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    store.loadFile(content, file.name, 'file')
  }
  reader.readAsText(file)
}

function openPicker() {
  fileInput.value?.click()
}

async function pasteFromClipboard() {
  const text = await navigator.clipboard.readText()
  store.loadFile(`{"patcher":${text}}`, 'clipboard.json', 'clipboard')
}
</script>

<template>
  <div class="file-drop-zone">
    <div
      class="drop-area"
      :class="{ dragging: isDragging }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <p v-if="store.fileName" class="loaded-file">
        <i class="pi pi-file" />
        <span>{{ store.fileName }} </span>
      </p>
      <p v-else class="drop-text">Drop a Max file here</p>
      <p v-if="store.rnbo" class="file-meta">
        {{ store.rnbo.patcher.boxes.length }} boxes, {{ store.rnbo.patcher.lines.length }} lines
      </p>
      <div class="drop-actions">
        <Button variant="outlined" label="Select file" size="small" @click="openPicker" />
        <Button
          label="Paste"
          size="small"
          variant="outlined"
          severity="info"
          @click="pasteFromClipboard()"
        />
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".maxpat,.json,.rnbopat,.gendsp"
        class="hidden-input"
        @change="onFileChange"
      />
    </div>
    <div v-if="store.error" class="file-error">
      <i class="pi pi-exclamation-triangle" />
      <span>{{ store.error }}</span>
    </div>
  </div>
</template>

<style scoped>
.file-drop-zone {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.drop-area {
  border: 1px solid var(--p-surface-700);
  border-radius: 8px;
  padding: 2rem 1.25rem 1.25rem;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  background: repeating-linear-gradient(
    45deg,
    var(--p-surface-900),
    var(--p-surface-900) 16px,
    var(--p-surface-700) 16px,
    var(--p-surface-700) 17px
  );
}

.drop-area.dragging {
  border-color: var(--p-primary-400);
  background: color-mix(in srgb, var(--p-primary-950) 40%, transparent);
}

.drop-text {
  height: 1.5rem;
  display: flex;
  gap: 0.5rem;
  color: var(--p-surface-400);
  font-size: 0.875rem;
  align-items: center;
  justify-content: center;
}

.drop-text code {
  color: var(--p-primary-300);
}

.drop-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hidden-input {
  display: none;
}

.loaded-file {
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.file-meta {
  position: absolute;
  top: 0.25rem;
  left: 1rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--p-surface-400);
}

.file-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-red-400);
}
</style>
