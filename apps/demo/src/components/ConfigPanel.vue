<script setup lang="ts">
import { ref } from 'vue'
import type { DirectiveBinding } from 'vue'
import { storeToRefs } from 'pinia'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import FlyingTooltip from './FlyingTooltip.vue'
import { useOptimizerStore } from '@/stores/optimizer'
import { configMeta, defaultConfig } from 'layout-maxing'
import type { Config } from 'layout-maxing'

const ft = ref<InstanceType<typeof FlyingTooltip>>()

const vTip = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const pos = binding.modifiers.right ? 'right' : 'top'
    el.addEventListener('mouseenter', (e) => ft.value?.show(e, binding.value, pos))
    el.addEventListener('mouseleave', () => ft.value?.hide())
    el.addEventListener('focusin', (e) => ft.value?.show(e, binding.value, pos))
    el.addEventListener('focusout', () => ft.value?.hide())
  },
}

const store = useOptimizerStore()
const { config: cfg, progressInterval, topN, isConfigDefault } = storeToRefs(store)

function numProps(key: keyof Config) {
  const [, min, max, step] = configMeta[key]
  const stepStr = step !== null ? String(step) : ''
  const decimals = stepStr.includes('.') ? (stepStr.split('.')[1]?.length ?? 0) : 0
  return {
    min: min as number,
    max: max as number,
    ...(step !== null ? { step: step as number } : {}),
    ...(decimals > 0 ? { minFractionDigits: decimals } : {}),
  }
}

function copyConfig() {
  const nonDefault: Record<string, unknown> = {}
  for (const k of Object.keys(defaultConfig) as (keyof Config)[]) {
    if (cfg.value[k] !== defaultConfig[k]) nonDefault[k] = cfg.value[k]
  }
  navigator.clipboard.writeText(JSON.stringify(nonDefault, null, 2))
}

async function pasteConfig() {
  const text = await navigator.clipboard.readText()
  const parsed = JSON.parse(text)
  Object.assign(cfg.value, parsed)
}

function isNonDefault(key: keyof Config): boolean {
  return cfg.value[key] !== defaultConfig[key]
}

const groupKeys = {
  grid: ['gridX', 'gridY', 'minDistX', 'minDistY', 'boxZone', 'letOffest', 'curveControl'],
  penalties: [
    'crossPenalty',
    'overPenalty',
    'reversePenalty',
    'areaPenalty',
    'totalDistPenalty',
    'arPenalty',
    'arMax',
    'totalCrossPenalty',
    'totalOverPenalty',
    'totalCollisionPenalty',
    'totalSSCPenalty',
    'misalignedSSPenalty',
    'misalignedFirstPenalty',
  ],
  mws: [
    'mutate',
    'mutWeightQuadrant',
    'mutWeightSingle',
    'mutWeightChildren',
    'maxChildren',
    'mutWeightParents',
    'maxParents',
    'mutWeightSwapSibling',
    'mutWeightSwapRandom',
    'mutWeightSwapInRow',
    'mutWeightSwapInCol',
    'mutWeightShiftRow',
    'mutWeightShiftCol',
  ],
  ga: [
    'deterministic',
    'seed',
    'popSize',
    'generations',
    'stop',
    'mutationRate',
    'crossoverRate',
    'crossoverMix',
    'tournamentSize',
  ],
  initial: ['useDagre', 'useSimpleFlow', 'useInput'],
  run: [
    'logProgressInterval',
    'logProgress',
    'logInfo',
    'writeSvg',
    'showStraightLines',
    'writeJson',
    'removeLineSegments',
    'normalize',
    'normalizeExport',
    'ignoreOrphans',
    'keepGroups',
  ],
} as const satisfies Record<string, (keyof Config)[]>

function isGroupNonDefault(keys: readonly (keyof Config)[]): boolean {
  return keys.some((k) => isNonDefault(k))
}

function resetProp(key: keyof Config) {
  ;(cfg.value as Record<keyof Config, unknown>)[key] = defaultConfig[key]
}

function handleShiftKey(event: KeyboardEvent, key: keyof Config) {
  if (!event.shiftKey) return
  const [, min, max] = configMeta[key]
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    ;(cfg.value as Record<keyof Config, unknown>)[key] = max
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    ;(cfg.value as Record<keyof Config, unknown>)[key] = min
  } else if (event.key === 'Enter') {
    event.preventDefault()
    resetProp(key)
  }
}

function copyCli() {
  const parts = ['deno run -A packages/layout-maxing-cli/src/index.ts layout <input.json>']
  for (const k of Object.keys(defaultConfig) as (keyof Config)[]) {
    const val = cfg.value[k]
    const def = defaultConfig[k]
    if (val === def) continue
    if (typeof def === 'boolean') {
      parts.push(val ? `--${k}` : `--${k} false`)
    } else {
      parts.push(`--${k} ${val}`)
    }
  }
  navigator.clipboard.writeText(parts.join(' \\\n  '))
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <span class="config-title">Config</span>
      <div class="config-actions">
        <Button
          icon="pi pi-copy"
          size="small"
          severity="secondary"
          text
          v-tip.top="'Copy config JSON'"
          @click="copyConfig"
        />
        <Button
          icon="pi pi-clipboard"
          size="small"
          severity="secondary"
          text
          v-tip.top="'Paste config JSON'"
          @click="pasteConfig"
        />
        <Button
          icon="pi pi-chevron-right"
          size="small"
          severity="secondary"
          text
          v-tip.top="'Copy CLI command'"
          @click="copyCli"
        />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          size="small"
          :severity="isConfigDefault ? 'secondary' : 'warning'"
          text
          @click="store.resetConfig()"
        />
      </div>
    </div>

    <Accordion :value="[]" multiple class="accordion">
      <AccordionPanel value="grid">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.grid) }"
          >Geometry</AccordionHeader
        >
        <AccordionContent>
          <div class="fields-grid">
            <label
              :class="{ 'non-default': isNonDefault('gridX') }"
              @click="isNonDefault('gridX') && resetProp('gridX')"
              >gridX</label
            >
            <InputNumber
              v-model="cfg.gridX"
              v-bind="numProps('gridX')"
              size="small"
              v-tip.right="configMeta.gridX[4]"
              @keydown="handleShiftKey($event, 'gridX')"
            />
            <label
              :class="{ 'non-default': isNonDefault('gridY') }"
              @click="isNonDefault('gridY') && resetProp('gridY')"
              >gridY</label
            >
            <InputNumber
              v-model="cfg.gridY"
              v-bind="numProps('gridY')"
              size="small"
              v-tip.right="configMeta.gridY[4]"
              @keydown="handleShiftKey($event, 'gridY')"
            />
            <label
              :class="{ 'non-default': isNonDefault('minDistX') }"
              @click="isNonDefault('minDistX') && resetProp('minDistX')"
              >minDistX</label
            >
            <InputNumber
              v-model="cfg.minDistX"
              v-bind="numProps('minDistX')"
              size="small"
              v-tip.right="configMeta.minDistX[4]"
              @keydown="handleShiftKey($event, 'minDistX')"
            />
            <label
              :class="{ 'non-default': isNonDefault('minDistY') }"
              @click="isNonDefault('minDistY') && resetProp('minDistY')"
              >minDistY</label
            >
            <InputNumber
              v-model="cfg.minDistY"
              v-bind="numProps('minDistY')"
              size="small"
              v-tip.right="configMeta.minDistY[4]"
              @keydown="handleShiftKey($event, 'minDistY')"
            />
            <label
              :class="{ 'non-default': isNonDefault('boxZone') }"
              @click="isNonDefault('boxZone') && resetProp('boxZone')"
              >boxZone</label
            >
            <InputNumber
              v-model="cfg.boxZone"
              v-bind="numProps('boxZone')"
              size="small"
              v-tip.right="configMeta.boxZone[4]"
              @keydown="handleShiftKey($event, 'boxZone')"
            />
            <label
              :class="{ 'non-default': isNonDefault('letOffest') }"
              @click="isNonDefault('letOffest') && resetProp('letOffest')"
              >letOffset</label
            >
            <InputNumber
              v-model="cfg.letOffest"
              v-bind="numProps('letOffest')"
              size="small"
              v-tip.right="configMeta.letOffest[4]"
              @keydown="handleShiftKey($event, 'letOffest')"
            />
            <label
              :class="{ 'non-default': isNonDefault('curveControl') }"
              @click="isNonDefault('curveControl') && resetProp('curveControl')"
              >curveControl</label
            >
            <InputNumber
              v-model="cfg.curveControl"
              v-bind="numProps('curveControl')"
              size="small"
              v-tip.right="configMeta.curveControl[4]"
              @keydown="handleShiftKey($event, 'curveControl')"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="penalties">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.penalties) }"
          >Fitness Penalties</AccordionHeader
        >
        <AccordionContent>
          <div class="fields-grid">
            <label
              :class="{ 'non-default': isNonDefault('crossPenalty') }"
              @click="isNonDefault('crossPenalty') && resetProp('crossPenalty')"
              >crossPenalty</label
            >
            <InputNumber
              v-model="cfg.crossPenalty"
              v-bind="numProps('crossPenalty')"
              size="small"
              v-tip.right="configMeta.crossPenalty[4]"
              @keydown="handleShiftKey($event, 'crossPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('overPenalty') }"
              @click="isNonDefault('overPenalty') && resetProp('overPenalty')"
              >overPenalty</label
            >
            <InputNumber
              v-model="cfg.overPenalty"
              v-bind="numProps('overPenalty')"
              size="small"
              v-tip.right="configMeta.overPenalty[4]"
              @keydown="handleShiftKey($event, 'overPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('reversePenalty') }"
              @click="isNonDefault('reversePenalty') && resetProp('reversePenalty')"
              >reversePenalty</label
            >
            <InputNumber
              v-model="cfg.reversePenalty"
              v-bind="numProps('reversePenalty')"
              size="small"
              v-tip.right="configMeta.reversePenalty[4]"
              @keydown="handleShiftKey($event, 'reversePenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('areaPenalty') }"
              @click="isNonDefault('areaPenalty') && resetProp('areaPenalty')"
              >areaPenalty</label
            >
            <InputNumber
              v-model="cfg.areaPenalty"
              v-bind="numProps('areaPenalty')"
              size="small"
              v-tip.right="configMeta.areaPenalty[4]"
              @keydown="handleShiftKey($event, 'areaPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('totalDistPenalty') }"
              @click="isNonDefault('totalDistPenalty') && resetProp('totalDistPenalty')"
              >totalDistPenalty</label
            >
            <InputNumber
              v-model="cfg.totalDistPenalty"
              v-bind="numProps('totalDistPenalty')"
              size="small"
              v-tip.right="configMeta.totalDistPenalty[4]"
              @keydown="handleShiftKey($event, 'totalDistPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('arPenalty') }"
              @click="isNonDefault('arPenalty') && resetProp('arPenalty')"
              >arPenalty</label
            >
            <InputNumber
              v-model="cfg.arPenalty"
              v-bind="numProps('arPenalty')"
              size="small"
              v-tip.right="configMeta.arPenalty[4]"
              @keydown="handleShiftKey($event, 'arPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('arMax') }"
              @click="isNonDefault('arMax') && resetProp('arMax')"
              >arMax</label
            >
            <InputNumber
              v-model="cfg.arMax"
              v-bind="numProps('arMax')"
              size="small"
              v-tip.right="configMeta.arMax[4]"
              @keydown="handleShiftKey($event, 'arMax')"
            />
            <label
              :class="{ 'non-default': isNonDefault('totalCrossPenalty') }"
              @click="isNonDefault('totalCrossPenalty') && resetProp('totalCrossPenalty')"
              >totalCrossPenalty</label
            >
            <InputNumber
              v-model="cfg.totalCrossPenalty"
              v-bind="numProps('totalCrossPenalty')"
              size="small"
              v-tip.right="configMeta.totalCrossPenalty[4]"
              @keydown="handleShiftKey($event, 'totalCrossPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('totalOverPenalty') }"
              @click="isNonDefault('totalOverPenalty') && resetProp('totalOverPenalty')"
              >totalOverPenalty</label
            >
            <InputNumber
              v-model="cfg.totalOverPenalty"
              v-bind="numProps('totalOverPenalty')"
              size="small"
              v-tip.right="configMeta.totalOverPenalty[4]"
              @keydown="handleShiftKey($event, 'totalOverPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('totalCollisionPenalty') }"
              @click="isNonDefault('totalCollisionPenalty') && resetProp('totalCollisionPenalty')"
              >totalCollisionPenalty</label
            >
            <InputNumber
              v-model="cfg.totalCollisionPenalty"
              v-bind="numProps('totalCollisionPenalty')"
              size="small"
              v-tip.right="configMeta.totalCollisionPenalty[4]"
              @keydown="handleShiftKey($event, 'totalCollisionPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('totalSSCPenalty') }"
              @click="isNonDefault('totalSSCPenalty') && resetProp('totalSSCPenalty')"
              >totalSSCPenalty</label
            >
            <InputNumber
              v-model="cfg.totalSSCPenalty"
              v-bind="numProps('totalSSCPenalty')"
              size="small"
              v-tip.right="configMeta.totalSSCPenalty[4]"
              @keydown="handleShiftKey($event, 'totalSSCPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('misalignedSSPenalty') }"
              @click="isNonDefault('misalignedSSPenalty') && resetProp('misalignedSSPenalty')"
              >misalignedSSPenalty</label
            >
            <InputNumber
              v-model="cfg.misalignedSSPenalty"
              v-bind="numProps('misalignedSSPenalty')"
              size="small"
              v-tip.right="configMeta.misalignedSSPenalty[4]"
              @keydown="handleShiftKey($event, 'misalignedSSPenalty')"
            />
            <label
              :class="{ 'non-default': isNonDefault('misalignedFirstPenalty') }"
              @click="isNonDefault('misalignedFirstPenalty') && resetProp('misalignedFirstPenalty')"
              >misalignedFirstPen.</label
            >
            <InputNumber
              v-model="cfg.misalignedFirstPenalty"
              v-bind="numProps('misalignedFirstPenalty')"
              size="small"
              v-tip.right="configMeta.misalignedFirstPenalty[4]"
              @keydown="handleShiftKey($event, 'misalignedFirstPenalty')"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="mws">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.mws) }"
          >Mutations</AccordionHeader
        >
        <AccordionContent>
          <div class="fields-grid">
            <label
              :class="{ 'non-default': isNonDefault('mutate') }"
              @click="isNonDefault('mutate') && resetProp('mutate')"
              >mutate</label
            >
            <InputNumber
              v-model="cfg.mutate"
              v-bind="numProps('mutate')"
              size="small"
              v-tip.right="configMeta.mutate[4]"
              @keydown="handleShiftKey($event, 'mutate')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightQuadrant') }"
              @click="isNonDefault('mutWeightQuadrant') && resetProp('mutWeightQuadrant')"
              >mutWeightQuadrant</label
            >
            <InputNumber
              v-model="cfg.mutWeightQuadrant"
              v-bind="numProps('mutWeightQuadrant')"
              size="small"
              v-tip.right="configMeta.mutWeightQuadrant[4]"
              @keydown="handleShiftKey($event, 'mutWeightQuadrant')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightSingle') }"
              @click="isNonDefault('mutWeightSingle') && resetProp('mutWeightSingle')"
              >mutWeightSingle</label
            >
            <InputNumber
              v-model="cfg.mutWeightSingle"
              v-bind="numProps('mutWeightSingle')"
              size="small"
              v-tip.right="configMeta.mutWeightSingle[4]"
              @keydown="handleShiftKey($event, 'mutWeightSingle')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightChildren') }"
              @click="isNonDefault('mutWeightChildren') && resetProp('mutWeightChildren')"
              >mutWeightChildren</label
            >
            <InputNumber
              v-model="cfg.mutWeightChildren"
              v-bind="numProps('mutWeightChildren')"
              size="small"
              v-tip.right="configMeta.mutWeightChildren[4]"
              @keydown="handleShiftKey($event, 'mutWeightChildren')"
            />
            <label
              :class="{ 'non-default': isNonDefault('maxChildren') }"
              @click="isNonDefault('maxChildren') && resetProp('maxChildren')"
              >maxChildren</label
            >
            <InputNumber
              v-model="cfg.maxChildren"
              v-bind="numProps('maxChildren')"
              size="small"
              v-tip.right="configMeta.maxChildren[4]"
              @keydown="handleShiftKey($event, 'maxChildren')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightParents') }"
              @click="isNonDefault('mutWeightParents') && resetProp('mutWeightParents')"
              >mutWeightParents</label
            >
            <InputNumber
              v-model="cfg.mutWeightParents"
              v-bind="numProps('mutWeightParents')"
              size="small"
              v-tip.right="configMeta.mutWeightParents[4]"
              @keydown="handleShiftKey($event, 'mutWeightParents')"
            />
            <label
              :class="{ 'non-default': isNonDefault('maxParents') }"
              @click="isNonDefault('maxParents') && resetProp('maxParents')"
              >maxParents</label
            >
            <InputNumber
              v-model="cfg.maxParents"
              v-bind="numProps('maxParents')"
              size="small"
              v-tip.right="configMeta.maxParents[4]"
              @keydown="handleShiftKey($event, 'maxParents')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightSwapSibling') }"
              @click="isNonDefault('mutWeightSwapSibling') && resetProp('mutWeightSwapSibling')"
              >mutWeightSwapSibling</label
            >
            <InputNumber
              v-model="cfg.mutWeightSwapSibling"
              v-bind="numProps('mutWeightSwapSibling')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapSibling[4]"
              @keydown="handleShiftKey($event, 'mutWeightSwapSibling')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightSwapRandom') }"
              @click="isNonDefault('mutWeightSwapRandom') && resetProp('mutWeightSwapRandom')"
              >mutWeightSwapRandom</label
            >
            <InputNumber
              v-model="cfg.mutWeightSwapRandom"
              v-bind="numProps('mutWeightSwapRandom')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapRandom[4]"
              @keydown="handleShiftKey($event, 'mutWeightSwapRandom')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightSwapInRow') }"
              @click="isNonDefault('mutWeightSwapInRow') && resetProp('mutWeightSwapInRow')"
              >mutWeightSwapInRow</label
            >
            <InputNumber
              v-model="cfg.mutWeightSwapInRow"
              v-bind="numProps('mutWeightSwapInRow')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapInRow[4]"
              @keydown="handleShiftKey($event, 'mutWeightSwapInRow')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightSwapInCol') }"
              @click="isNonDefault('mutWeightSwapInCol') && resetProp('mutWeightSwapInCol')"
              >mutWeightSwapInCol</label
            >
            <InputNumber
              v-model="cfg.mutWeightSwapInCol"
              v-bind="numProps('mutWeightSwapInCol')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapInCol[4]"
              @keydown="handleShiftKey($event, 'mutWeightSwapInCol')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightShiftRow') }"
              @click="isNonDefault('mutWeightShiftRow') && resetProp('mutWeightShiftRow')"
              >mutWeightShiftRow</label
            >
            <InputNumber
              v-model="cfg.mutWeightShiftRow"
              v-bind="numProps('mutWeightShiftRow')"
              size="small"
              v-tip.right="configMeta.mutWeightShiftRow[4]"
              @keydown="handleShiftKey($event, 'mutWeightShiftRow')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutWeightShiftCol') }"
              @click="isNonDefault('mutWeightShiftCol') && resetProp('mutWeightShiftCol')"
              >mutWeightShiftCol</label
            >
            <InputNumber
              v-model="cfg.mutWeightShiftCol"
              v-bind="numProps('mutWeightShiftCol')"
              size="small"
              v-tip.right="configMeta.mutWeightShiftCol[4]"
              @keydown="handleShiftKey($event, 'mutWeightShiftCol')"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="ga">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.ga) }"
          >Genetic Algorithm</AccordionHeader
        >
        <AccordionContent>
          <div class="toggles-grid">
            <label
              :class="{ 'non-default': isNonDefault('deterministic') }"
              @click="isNonDefault('deterministic') && resetProp('deterministic')"
              >deterministic</label
            >
            <ToggleSwitch v-model="cfg.deterministic" v-tip.right="configMeta.deterministic[4]" />
          </div>
          <div class="fields-grid">
            <div class="wide-row">
              <label
                :class="{ 'non-default': isNonDefault('seed') }"
                @click="isNonDefault('seed') && resetProp('seed')"
                >seed</label
              >
              <InputNumber
                style="width: 120px"
                v-model="cfg.seed"
                v-bind="numProps('seed')"
                :disabled="!cfg.deterministic"
                size="small"
                v-tip.right="configMeta.seed[4]"
                @keydown="handleShiftKey($event, 'seed')"
              />
            </div>
            <label
              :class="{ 'non-default': isNonDefault('popSize') }"
              @click="isNonDefault('popSize') && resetProp('popSize')"
              >popSize</label
            >
            <InputNumber
              v-model="cfg.popSize"
              v-bind="numProps('popSize')"
              size="small"
              v-tip.right="configMeta.popSize[4]"
              @keydown="handleShiftKey($event, 'popSize')"
            />
            <label
              :class="{ 'non-default': isNonDefault('generations') }"
              @click="isNonDefault('generations') && resetProp('generations')"
              >generations</label
            >
            <InputNumber
              v-model="cfg.generations"
              v-bind="numProps('generations')"
              size="small"
              v-tip.right="configMeta.generations[4]"
              @keydown="handleShiftKey($event, 'generations')"
            />
            <label
              :class="{ 'non-default': isNonDefault('stop') }"
              @click="isNonDefault('stop') && resetProp('stop')"
              >stop</label
            >
            <InputNumber
              v-model="cfg.stop"
              v-bind="numProps('stop')"
              size="small"
              v-tip.right="configMeta.stop[4]"
              @keydown="handleShiftKey($event, 'stop')"
            />
            <label
              :class="{ 'non-default': isNonDefault('mutationRate') }"
              @click="isNonDefault('mutationRate') && resetProp('mutationRate')"
              >mutationRate</label
            >
            <InputNumber
              v-model="cfg.mutationRate"
              v-bind="numProps('mutationRate')"
              size="small"
              v-tip.right="configMeta.mutationRate[4]"
              @keydown="handleShiftKey($event, 'mutationRate')"
            />
            <label
              :class="{ 'non-default': isNonDefault('crossoverRate') }"
              @click="isNonDefault('crossoverRate') && resetProp('crossoverRate')"
              >crossoverRate</label
            >
            <InputNumber
              v-model="cfg.crossoverRate"
              v-bind="numProps('crossoverRate')"
              size="small"
              v-tip.right="configMeta.crossoverRate[4]"
              @keydown="handleShiftKey($event, 'crossoverRate')"
            />
            <label
              :class="{ 'non-default': isNonDefault('crossoverMix') }"
              @click="isNonDefault('crossoverMix') && resetProp('crossoverMix')"
              >crossoverMix</label
            >
            <InputNumber
              v-model="cfg.crossoverMix"
              v-bind="numProps('crossoverMix')"
              size="small"
              v-tip.right="configMeta.crossoverMix[4]"
              @keydown="handleShiftKey($event, 'crossoverMix')"
            />
            <label
              :class="{ 'non-default': isNonDefault('tournamentSize') }"
              @click="isNonDefault('tournamentSize') && resetProp('tournamentSize')"
              >tournamentSize</label
            >
            <InputNumber
              v-model="cfg.tournamentSize"
              v-bind="numProps('tournamentSize')"
              size="small"
              v-tip.right="configMeta.tournamentSize[4]"
              @keydown="handleShiftKey($event, 'tournamentSize')"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="initial">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.initial) }"
          >Initial Population</AccordionHeader
        >
        <AccordionContent>
          <div class="toggles-grid">
            <label
              :class="{ 'non-default': isNonDefault('useDagre') }"
              @click="isNonDefault('useDagre') && resetProp('useDagre')"
              >useDagre</label
            >
            <ToggleSwitch v-model="cfg.useDagre" v-tip.right="configMeta.useDagre[4]" />
            <label
              :class="{ 'non-default': isNonDefault('useSimpleFlow') }"
              @click="isNonDefault('useSimpleFlow') && resetProp('useSimpleFlow')"
              >useSimpleFlow</label
            >
            <ToggleSwitch v-model="cfg.useSimpleFlow" v-tip.right="configMeta.useSimpleFlow[4]" />
            <label
              :class="{ 'non-default': isNonDefault('useInput') }"
              @click="isNonDefault('useInput') && resetProp('useInput')"
              >useInput</label
            >
            <ToggleSwitch v-model="cfg.useInput" v-tip.right="configMeta.useInput[4]" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <!-- Run settings (part of Config) -->
      <AccordionPanel value="run">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(groupKeys.run) }"
          >Run Settings</AccordionHeader
        >
        <AccordionContent>
          <div class="fields-grid">
            <label
              :class="{ 'non-default': isNonDefault('logProgressInterval') }"
              @click="isNonDefault('logProgressInterval') && resetProp('logProgressInterval')"
              >logProgressInterval</label
            >
            <InputNumber
              v-model="cfg.logProgressInterval"
              :min="200"
              :max="60000"
              :step="500"
              size="small"
              v-tip.right="configMeta.logProgressInterval[4]"
              @keydown="handleShiftKey($event, 'logProgressInterval')"
            />
          </div>
          <div class="toggles-grid">
            <label
              :class="{ 'non-default': isNonDefault('logProgress') }"
              @click="isNonDefault('logProgress') && resetProp('logProgress')"
              >logProgress</label
            >
            <ToggleSwitch v-model="cfg.logProgress" v-tip.right="configMeta.logProgress[4]" />
            <label
              :class="{ 'non-default': isNonDefault('logInfo') }"
              @click="isNonDefault('logInfo') && resetProp('logInfo')"
              >logInfo</label
            >
            <ToggleSwitch v-model="cfg.logInfo" v-tip.right="configMeta.logInfo[4]" />
            <label
              :class="{ 'non-default': isNonDefault('writeSvg') }"
              @click="isNonDefault('writeSvg') && resetProp('writeSvg')"
              >writeSvg</label
            >
            <ToggleSwitch v-model="cfg.writeSvg" v-tip.right="configMeta.writeSvg[4]" />
            <label
              :class="{ 'non-default': isNonDefault('showStraightLines') }"
              @click="isNonDefault('showStraightLines') && resetProp('showStraightLines')"
              >showStraightLines</label
            >
            <ToggleSwitch
              v-model="cfg.showStraightLines"
              v-tip.right="configMeta.showStraightLines[4]"
            />
            <label
              :class="{ 'non-default': isNonDefault('writeJson') }"
              @click="isNonDefault('writeJson') && resetProp('writeJson')"
              >writeJson</label
            >
            <ToggleSwitch v-model="cfg.writeJson" v-tip.right="configMeta.writeJson[4]" />
            <label
              :class="{ 'non-default': isNonDefault('removeLineSegments') }"
              @click="isNonDefault('removeLineSegments') && resetProp('removeLineSegments')"
              >removeLineSegments</label
            >
            <ToggleSwitch
              v-model="cfg.removeLineSegments"
              v-tip.right="configMeta.removeLineSegments[4]"
            />
            <label
              :class="{ 'non-default': isNonDefault('normalize') }"
              @click="isNonDefault('normalize') && resetProp('normalize')"
              >normalize</label
            >
            <ToggleSwitch v-model="cfg.normalize" v-tip.right="configMeta.normalize[4]" />
            <label
              :class="{ 'non-default': isNonDefault('normalizeExport') }"
              @click="isNonDefault('normalizeExport') && resetProp('normalizeExport')"
              >normalizeExport</label
            >
            <ToggleSwitch
              v-model="cfg.normalizeExport"
              v-tip.right="configMeta.normalizeExport[4]"
            />
            <label
              :class="{ 'non-default': isNonDefault('ignoreOrphans') }"
              @click="isNonDefault('ignoreOrphans') && resetProp('ignoreOrphans')"
              >ignoreOrphans</label
            >
            <ToggleSwitch v-model="cfg.ignoreOrphans" v-tip.right="configMeta.ignoreOrphans[4]" />
            <label
              :class="{ 'non-default': isNonDefault('keepGroups') }"
              @click="isNonDefault('keepGroups') && resetProp('keepGroups')"
              >keepGroups</label
            >
            <ToggleSwitch v-model="cfg.keepGroups" v-tip.right="configMeta.keepGroups[4]" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <!-- UI settings (not part of Config) -->
      <AccordionPanel value="ui">
        <AccordionHeader>UI Settings</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>progressInterval</label>
            <InputNumber
              v-model="progressInterval"
              :min="200"
              :max="10000"
              size="small"
              v-tip.right="'Post stats every N evaluations'"
            />
            <label>topN</label>
            <InputNumber
              v-model="topN"
              :min="1"
              :max="100"
              size="small"
              v-tip.right="'Number of top candidates to track and preview'"
            />
          </div>
          <div class="toggles-grid">
            <label>showStats</label>
            <ToggleSwitch v-model="store.showStats" />
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
    <FlyingTooltip ref="ft" />
  </div>
</template>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 0.5rem;
  --p-accordion-header-padding: 0.75rem 0.75rem 0.75rem 0.75rem;
  --p-accordion-content-padding: 0 0.75rem 1rem 0;
}

.config-panel:deep(.p-accordionpanel:last-child) {
  --p-accordion-panel-border-width: 0;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.config-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-surface-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fields-grid {
  display: grid;
  grid-template-columns: auto 80px;
  gap: 0.4rem 0.75rem;
  align-items: center;
  justify-items: right;
  font-size: 0.8rem;
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.wide-row {
  display: grid;
  grid-template-columns: auto 120px;
  grid-column: 1 / -1; /* span full width of parent grid */
  gap: 0.4rem 0.75rem;
  align-items: center;
  justify-items: right;
  font-size: 0.8rem;
}

.fields-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}

.fields-grid label.non-default,
.toggles-grid label.non-default {
  color: var(--p-primary-400);
  cursor: pointer;
}

:deep(.p-accordionheader.non-default) {
  color: var(--p-primary-600);
}

:deep(.p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader.non-default) {
  color: var(--p-primary-400);
}

:deep(
  .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled)
    > .p-accordionheader.non-default:hover
) {
  color: var(--p-primary-300);
}

:deep(
  .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader.non-default:hover
) {
  color: var(--p-primary-300);
}

:deep(.p-accordionheader.non-default)::before {
  content: '*';
  margin-right: 0.25rem;
}

:deep(.p-accordionheader.non-default > svg) {
  margin-left: auto;
}

.fields-grid label.non-default::before,
.toggles-grid label.non-default::before {
  content: '*';
  margin-right: 0.25rem;
}

.fields-grid:deep(.p-inputnumber > *) {
  width: 80px;
}

.toggles-grid {
  display: grid;
  grid-template-columns: auto 80px;
  gap: 0.6rem 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  margin-top: 0.6rem;
  margin-bottom: 0.6rem;
  justify-items: right;
}

.toggles-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}

.accordion {
  --p-accordion-header-font-weight: initial;
  font-size: 15px;
}
</style>
