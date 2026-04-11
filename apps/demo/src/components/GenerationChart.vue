<script setup lang="ts">
import type { GenerationSnapshot } from 'layout-maxing'
import { computed } from 'vue'
import { formatScore } from '@/utils/formatScore.ts'

const props = defineProps<{
  snapshots: GenerationSnapshot[]
}>()

const W = 240
const H = 72
const M = 6
const PAD = { top: 1, right: 40, bottom: 11, left: 40 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function toPath(points: [number, number][]): string {
  if (!points.length) return ''
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
}

const chart = computed(() => {
  const snaps = props.snapshots
  if (snaps.length < 2) return null

  const n = snaps.length

  // Log scale — fitness spans orders of magnitude, log makes all improvements visible
  // const L = (v: number) => Math.log(Math.max(1, v))

  // const logBest = snaps.map((s) => L(s.best))
  const logBest = snaps.map((s) => s.best)
  // const logMedian = snaps.map((s) => L(s.median))
  // const logP75 = snaps.map((s) => L(s.p75))

  const logMin = Math.min(...logBest)
  const logMax = Math.max(...logBest)
  const logRange = logMax - logMin || 1

  const logDiv = snaps.map((s) => s.diversity)

  const logMinDiv = Math.min(...logDiv)
  const logMaxDiv = Math.max(...logDiv)
  const logRangeDiv = logMaxDiv - logMinDiv || 1

  const xOf = (i: number) => PAD.left + (i / (n - 1)) * innerW
  // low score (good) → top of chart
  // const yScore = (v: number) => PAD.top + ((L(v) - logMin) / logRange) * innerH
  const yScore = (v: number) => PAD.top + ((v - logMin) / logRange) * innerH
  const yDiversity = (v: number) => PAD.top + ((v - logMinDiv) / logRangeDiv) * innerH

  console.log(logMinDiv, logMaxDiv, logRangeDiv)

  const bestPts: [number, number][] = snaps.map((s, i) => [xOf(i), yScore(s.best)])
  const medianPts: [number, number][] = snaps.map((s, i) => [xOf(i), yScore(s.median)])
  const p75Pts: [number, number][] = snaps.map((s, i) => [xOf(i), yScore(s.p75)])
  const divPts: [number, number][] = snaps.map((s, i) => [xOf(i), yDiversity(s.diversity)])

  // Area fill between median and best
  const areaPath =
    bestPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ' ' +
    [...medianPts]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ') +
    ' Z'

  return {
    bestPath: toPath(bestPts),
    medianPath: toPath(medianPts),
    p75Path: toPath(p75Pts),
    divPath: toPath(divPts),
    areaPath,
    firstGen: snaps[0]!.gen,
    lastGen: snaps[n - 1]!.gen,
    minScore: formatScore(logMin),
    maxScore: formatScore(logMax),
    minDiv: logMinDiv.toFixed(2),
    maxDiv: logMaxDiv.toFixed(2),
  }
})
</script>

<template>
  <div v-if="snapshots.length >= 2" class="gen-chart">
    <svg :width="W" :height="H" class="chart-svg">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--p-primary-500)" stop-opacity="0.15" />
          <stop offset="100%" stop-color="var(--p-primary-500)" stop-opacity="0.02" />
        </linearGradient>
        <clipPath id="chart-clip">
          <rect :x="PAD.left" :y="PAD.top" :width="innerW" :height="innerH" />
        </clipPath>
      </defs>

      <!-- x-axis baseline -->
      <line
        :x1="PAD.left"
        :y1="PAD.top + innerH"
        :x2="PAD.left + innerW"
        :y2="PAD.top + innerH"
        stroke="var(--p-surface-700)"
        stroke-width="1"
      />

      <g clip-path="url(#chart-clip)">
        <!-- area fill best→p75 -->
        <!--        <path :d="chart!.areaPath" fill="url(#area-grad)" />-->

        <!-- p75 line -->
        <!--        <path :d="chart!.p75Path" fill="none" stroke="var(&#45;&#45;p-surface-600)" stroke-width="1" />-->

        <!-- median line -->
        <path
          :d="chart!.medianPath"
          fill="none"
          stroke="var(--p-surface-400)"
          stroke-width="1"
          stroke-opacity=".75"
        />

        <!-- diversity line -->
        <path
          :d="chart!.divPath"
          fill="none"
          stroke="var(--p-cyan-600)"
          stroke-width="1"
          stroke-opacity=".75"
        />

        <!-- best line -->
        <path :d="chart!.bestPath" fill="none" stroke="var(--p-primary-400)" stroke-width="1" />
      </g>

      <!-- gen labels -->
      <text :x="PAD.left" :y="H - PAD.bottom + M" alignment-baseline="hanging" class="axis-label">
        GEN: {{ chart!.firstGen }}
      </text>
      <text
        :x="PAD.left + innerW"
        :y="H - PAD.bottom + M"
        alignment-baseline="hanging"
        text-anchor="end"
        class="axis-label"
      >
        GEN: {{ chart!.lastGen }}
      </text>
      <!-- score labels -->
      <text
        :x="PAD.left - M"
        :y="H - PAD.bottom - M / 2"
        text-anchor="end"
        class="axis-label"
        style="fill: var(--p-primary-400)"
      >
        {{ chart!.maxScore }}
      </text>
      <text
        :x="PAD.left - M"
        :y="PAD.top"
        text-anchor="end"
        alignment-baseline="hanging"
        class="axis-label"
        style="fill: var(--p-primary-400)"
      >
        {{ chart!.minScore }}
      </text>
      <!-- div labels -->
      <text
        :x="W - PAD.right + M"
        :y="H - PAD.bottom - M / 2"
        text-anchor="start"
        class="axis-label"
        style="fill: var(--p-cyan-600)"
      >
        {{ chart!.minDiv }}
      </text>
      <text
        :x="W - PAD.right + M"
        :y="PAD.top"
        text-anchor="start"
        alignment-baseline="hanging"
        class="axis-label"
        style="fill: var(--p-cyan-600)"
      >
        {{ chart!.maxDiv }}
      </text>
    </svg>

    <div class="chart-legend">
      <span class="legend-item best">best</span>
      <span class="legend-item median">median</span>
      <!--      <span class="legend-item p75">p75</span>-->
      <span class="legend-item diversity">diversity</span>
    </div>
  </div>
</template>

<style scoped>
.gen-chart {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  user-select: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.axis-label {
  font-size: 8px;
  fill: var(--p-surface-500);
  font-family: monospace;
}

.chart-legend {
  display: flex;
  padding: 0.5rem 40px 0.5rem 40px;
  justify-content: space-between;
  user-select: none;
}

.legend-item {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-item::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 2px;
}

.legend-item.best {
  color: var(--p-primary-400);
}
.legend-item.best::before {
  background: var(--p-primary-400);
}

.legend-item.median {
  color: var(--p-surface-400);
}
.legend-item.median::before {
  background: var(--p-surface-400);
}

.legend-item.p75 {
  color: var(--p-surface-500);
}
.legend-item.p75::before {
  background: var(--p-surface-600);
}

.legend-item.diversity {
  color: var(--p-cyan-500);
}
.legend-item.diversity::before {
  background: var(--p-cyan-500);
  opacity: 0.7;
}
</style>
