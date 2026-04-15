import { ref } from 'vue'

const highlightedFeatures = ref<string[]>([])

export function useHighlight() {
  function setHighlight(features: string[]) {
    highlightedFeatures.value = features
  }
  function clearHighlight() {
    highlightedFeatures.value = []
  }
  function isHighlighted(features: string[]): boolean {
    if (!highlightedFeatures.value.length || !features.length) return false
    return highlightedFeatures.value.some((h) => features.some((f) => f.indexOf(h) !== -1 || h.indexOf(f) !== -1))
  }
  return { highlightedFeatures, setHighlight, clearHighlight, isHighlighted }
}
