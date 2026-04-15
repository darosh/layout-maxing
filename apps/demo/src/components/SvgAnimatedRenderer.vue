<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { getOutletPos, getInletPos, getViewPort, normalizeLayouts, cloneLayouts, type Box } from 'layout-maxing'
import { defaultConfig } from 'layout-maxing'

const store = useOptimizerStore()

const cfg = computed(() => ({ ...defaultConfig, ...store.config }))

const layouts = ref<Box[]>([])
const lines = computed(() => store.lines)

const viewport = computed(() => {
  if (!layouts.value.length) return { x: 0, y: 0, width: 800, height: 600 }
  const vp = getViewPort(layouts.value, cfg.value.gridX)
  return { x: vp[0]!, y: vp[1]!, width: vp[2]!, height: vp[3]! }
})

// Container pixel size — drives stableVP aspect so viewBox matches the real
// available proportions (avoids preserveAspectRatio letterboxing on top of
// our own scale-to-fit).
const rootEl = ref<HTMLDivElement | null>(null)
const containerSize = ref<{ w: number; h: number }>({ w: 0, h: 0 })

let ro: ResizeObserver | null = null
watch(rootEl, (el) => {
  if (ro) {
    ro.disconnect()
    ro = null
  }
  if (!el) return
  ro = new ResizeObserver(() => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (w > 0 && h > 0) containerSize.value = { w, h }
  })
  ro.observe(el)
  // initialize synchronously too
  if (el.clientWidth > 0 && el.clientHeight > 0) {
    containerSize.value = { w: el.clientWidth, h: el.clientHeight }
  }
})
onBeforeUnmount(() => {
  if (ro) {
    ro.disconnect()
    ro = null
  }
})

// Stable viewBox in SVG units, aspect-locked to the container. Grows by
// doubling (both axes) when the live layout no longer fits. Rebuilt when the
// container aspect changes. Reset when layouts go empty.
const stableVP = ref<{ w: number; h: number } | null>(null)
// Disable transitions for one frame whenever viewBox jumps so rootTransform
// and viewBox update atomically.
const skipRootTransition = ref(true)

// Suppress all layout transitions on run start (boxes flying from old positions)
const skipAllTransitions = ref(true)

watch(
  () => store.runId,
  () => {
    skipAllTransitions.value = true
  },
)

watch(
  () => store.displayedLayouts,
  () => {
    const clone = cloneLayouts(store.displayedLayouts)
    normalizeLayouts(clone)
    layouts.value = clone

    if (!skipAllTransitions.value) {
      return
    }

    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            skipAllTransitions.value = false
          })
        })
      })
    })
  },
)

const ASPECT_EPS = 0.01

function jump(next: { w: number; h: number }) {
  skipRootTransition.value = true
  stableVP.value = next
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        skipRootTransition.value = false
      })
    })
  })
}

watch(layouts, (l) => {
  if (!l.length) stableVP.value = null
})

watch(
  [viewport, containerSize],
  ([vp, cs]) => {
    if (!layouts.value.length) return
    if (cs.w <= 0 || cs.h <= 0) return

    const containerAspect = cs.w / cs.h
    let w: number
    let h: number

    if (!stableVP.value) {
      // Seed in pixel-ish units at container size so stroke widths feel right.
      w = cs.w
      h = cs.h
    } else {
      w = stableVP.value.w
      h = stableVP.value.h
      const curAspect = w / h
      if (Math.abs(curAspect - containerAspect) / containerAspect > ASPECT_EPS) {
        // Rebuild to new aspect, keeping area roughly comparable.
        const area = w * h
        h = Math.sqrt(area / containerAspect)
        w = h * containerAspect
      }
    }

    // Grow by doubling until layout fits (maintains aspect).
    while (w < vp.width || h < vp.height) {
      w *= 2
      h *= 2
    }

    const prev = stableVP.value
    if (!prev || prev.w !== w || prev.h !== h) {
      jump({ w, h })
    }
  },
  { immediate: true },
)

// viewBox aspect == container aspect ⇒ preserveAspectRatio is a no-op.
const viewBox = computed(() => {
  const svp = stableVP.value
  return svp ? `0 0 ${svp.w} ${svp.h}` : '0 0 512 512'
})

// Scale so the real layout fills the stable viewport (which now has the
// container's true proportions), then center + offset to origin.
const PADDING = 0.95
const rootScale = computed(() => {
  const { width, height } = viewport.value
  const svp = stableVP.value
  if (!svp) return 1
  return Math.min(svp.w / width, svp.h / height) * PADDING
})
const rootTransform = computed(() => {
  const { x, y, width, height } = viewport.value
  const svp = stableVP.value
  if (!svp) return 'none'
  const { w, h } = svp
  const scale = Math.min(w / width, h / height) * PADDING
  const cx = (w - width * scale) / 2
  const cy = (h - height * scale) / 2
  const tx = cx - x * scale
  const ty = cy - y * scale
  return `translate(${tx}px, ${ty}px) scale(${scale})`
})
const gridStrokeWidth = computed(() => 1 / rootScale.value)

const boxMap = computed(() => {
  const m = new Map<string, (typeof layouts.value)[number]>()
  for (const box of layouts.value) m.set(box.id, box)
  return m
})

interface GroupRect {
  key: string
  x: number
  y: number
  width: number
  height: number
}

const GROUP_PAD = 5

const groupRects = computed<GroupRect[]>(() => {
  if (!store.config.keepGroups) return []
  const boxgroups = store.rnbo?.patcher.boxgroups
  if (!boxgroups?.length) return []
  const bm = boxMap.value
  const result: GroupRect[] = []
  for (let i = 0; i < boxgroups.length; i++) {
    const group = boxgroups[i]!
    const members = group.boxes.map((id) => bm.get(id)).filter(Boolean) as (typeof layouts.value)[number][]
    if (members.length < 2) continue
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const m of members) {
      if (m.x < minX) minX = m.x
      if (m.y < minY) minY = m.y
      if (m.x + m.width > maxX) maxX = m.x + m.width
      if (m.y + m.height > maxY) maxY = m.y + m.height
    }
    result.push({
      key: `g${i}`,
      x: minX - GROUP_PAD,
      y: minY - GROUP_PAD,
      width: maxX - minX + GROUP_PAD * 2,
      height: maxY - minY + GROUP_PAD * 2,
    })
  }
  return result
})

interface PathItem {
  key: string
  d: string
}

interface DotItem {
  key: string
  cx: number
  cy: number
}

const pathData = computed<PathItem[]>(() => {
  const result: PathItem[] = []
  const bm = boxMap.value
  const c = cfg.value

  for (let i = 0; i < lines.value.length; i++) {
    const line = lines.value[i]!
    const p = line.patchline
    const [sourceId, outletIdx] = p.source
    const [destId, inletIdx] = p.destination

    const sourceBox = bm.get(sourceId)
    const destBox = bm.get(destId)
    if (!sourceBox || !destBox) continue

    const [sx, sy] = getOutletPos(sourceBox, outletIdx, c)
    const [ex, ey] = getInletPos(destBox, inletIdx, c)

    const c1y = sy + c.curveControl
    const c2y = ey - c.curveControl

    result.push({
      key: `l${i}`,
      d: `M ${sx},${sy} C ${sx},${c1y} ${ex},${c2y} ${ex},${ey}`,
    })
  }
  return result
})

const portDots = computed<DotItem[]>(() => {
  const result: DotItem[] = []
  const bm = boxMap.value
  const c = cfg.value

  for (let i = 0; i < lines.value.length; i++) {
    const line = lines.value[i]!
    const p = line.patchline
    const [sourceId, outletIdx] = p.source
    const [destId, inletIdx] = p.destination

    const sourceBox = bm.get(sourceId)
    const destBox = bm.get(destId)
    if (!sourceBox || !destBox) continue

    const [sx, sy] = getOutletPos(sourceBox, outletIdx, c)
    const [ex, ey] = getInletPos(destBox, inletIdx, c)

    result.push({ key: `s${i}`, cx: sx, cy: sy })
    result.push({ key: `d${i}`, cx: ex, cy: ey })
  }
  return result
})
</script>

<template>
  <div
    ref="rootEl"
    class="svg-animated-renderer">
    <svg
      v-if="layouts.length"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
      class="svg-canvas">
      <defs>
        <pattern
          id="grid-pattern"
          :width="cfg.gridX"
          :height="cfg.gridY"
          patternUnits="userSpaceOnUse">
          <path
            :d="`M ${cfg.gridX} 0 L 0 0 0 ${cfg.gridY}`"
            fill="none"
            stroke="rgba(144,144,144,0.3)"
            :stroke-width="gridStrokeWidth" />
        </pattern>
      </defs>
      <g
        :class="['layout-root', { 'layout-root--jump': skipRootTransition || skipAllTransitions }]"
        :style="{ transform: rootTransform }">
        <!-- Grid overlay -->
        <rect
          v-if="store.showGrid"
          x="-100000"
          y="-100000"
          width="200000"
          height="200000"
          fill="url(#grid-pattern)"
          class="grid-overlay" />
        <!-- Group bounding boxes -->
        <rect
          v-for="gr in groupRects"
          :key="gr.key"
          :x="gr.x"
          :y="gr.y"
          :width="gr.width"
          :height="gr.height"
          rx="6"
          :class="['group-bbox', { 'group-bbox--jump': skipAllTransitions }]" />

        <!-- Boxes: animate position via CSS transform on the group -->
        <g
          v-for="box in layouts"
          :key="box.id"
          :style="{ transform: `translate(${box.x}px, ${box.y}px)` }"
          :class="['box-group', { 'box-group--jump': skipAllTransitions }]">
          <rect
            :width="box.width"
            :height="box.height"
            rx="4"
            class="box" />
        </g>

        <!-- Lines: d attribute is CSS-animatable in modern browsers -->
        <path
          v-for="item in pathData"
          :key="item.key"
          :d="item.d"
          :class="['line', { 'line--jump': skipAllTransitions }]" />

        <!-- Port dots -->
        <g
          v-for="dot in portDots"
          :key="dot.key"
          :style="{ transform: `translate(${dot.cx}px, ${dot.cy}px)` }"
          :class="['port-group', { 'port-group--jump': skipAllTransitions }]">
          <path
            d="m 0 0 l 0 0"
            stroke-width="6"
            class="port" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.grid-overlay {
  pointer-events: none;
}

.svg-animated-renderer {
  --t-transform: transform 200ms ease;
  --t-transform-root: transform 200ms ease;
  --t-d: d 200ms ease;
  --t-transform-bbox: x 200ms ease, y 200ms ease, width 200ms ease, height 200ms ease;

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

svg path,
svg rect {
  vector-effect: non-scaling-stroke;
}

.svg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.layout-root {
  transition: var(--t-transform-root);
  transform-origin: 0 0;
}

.layout-root--jump {
  transition: none;
}

.box-group {
  transition: var(--t-transform);
}

.box-group--jump {
  transition: none;
}

.group-bbox {
  fill: none;
  stroke: #aaa;
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
  opacity: 0.5;
  transition: var(--t-transform-bbox);
}

.group-bbox--jump {
  transition: none;
}

.box {
  fill: #ccc;
  fill-opacity: 0.15;
  stroke: #666;
  stroke-width: 3;
}

.line {
  fill: none;
  stroke: var(--p-sky-400);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: var(--t-d);
}

.line--jump {
  transition: none;
}

.port-group {
  transition: var(--t-transform);
}

.port-group--jump {
  transition: none;
}

.port {
  stroke: var(--p-sky-400);
  stroke-linejoin: round;
  stroke-linecap: round;
}
</style>
