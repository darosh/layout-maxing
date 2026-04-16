import { ref } from 'vue'

const highlightedFeatures = ref<string[]>([])

export function useHighlight() {
  let timer: null | number = null

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function setHighlight(features: string[]) {
    clear()
    highlightedFeatures.value = features
  }
  function clearHighlight(timeout = 200) {
    timer = setTimeout(() => {
      highlightedFeatures.value = []
      timer = null
    }, timeout)
  }
  function isHighlighted(features: string[]): boolean {
    if (!highlightedFeatures.value.length || !features.length) return false
    return highlightedFeatures.value.some((h) => features.some((f) => f.indexOf(h) !== -1 || h.indexOf(f) !== -1))
  }
  return { highlightedFeatures, setHighlight, clearHighlight, isHighlighted }
}
