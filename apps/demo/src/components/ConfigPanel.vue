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
import { configMeta, configFeatureTags, defaultConfig } from 'layout-maxing'
import type { Config } from 'layout-maxing'
import { useHighlight } from '@/composables/useHighlight.ts'

const ft = ref<InstanceType<typeof FlyingTooltip>>()
const { setHighlight, clearHighlight, isHighlighted } = useHighlight()

type TipBinding = string | { text: string; features?: string[] }

const vTip = {
  mounted(el: HTMLElement, binding: DirectiveBinding<TipBinding>) {
    const pos = binding.modifiers.right ? 'right' : 'top'
    const getText = () => (typeof binding.value === 'string' ? binding.value : binding.value.text)
    const getFeatures = () =>
      typeof binding.value === 'string' ? [] : (binding.value.features ?? [])
    el.addEventListener('mouseenter', (e) => {
      setHighlight(getFeatures())
      ft.value?.show(e, getText(), pos)
    })
    el.addEventListener('mouseleave', () => {
      clearHighlight()
      ft.value?.hide()
    })
    el.addEventListener('focusin', (e) => {
      setHighlight(getFeatures())
      ft.value?.show(e, getText(), pos)
    })
    el.addEventListener('focusout', () => {
      clearHighlight()
      ft.value?.hide()
    })
  },
}

function configTip(key: keyof Config): TipBinding {
  const desc = configMeta[key][4]
  const tags = configFeatureTags[key]
  if (!tags?.length) return desc
  return { text: `${desc} [${tags.join(', ')}]`, features: tags }
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

function isBoolean(key: keyof Config): boolean {
  return typeof configMeta[key][0] === 'boolean'
}

function cfgNum(key: keyof Config): number {
  return cfg.value[key] as number
}

function cfgBool(key: keyof Config): boolean {
  return cfg.value[key] as boolean
}

function setCfgNum(key: keyof Config, val: number) {
  ;(cfg.value as Record<keyof Config, unknown>)[key] = val
}

function setCfgBool(key: keyof Config, val: boolean) {
  ;(cfg.value as Record<keyof Config, unknown>)[key] = val
}

type FieldDef = {
  key: keyof Config
  wideRow?: true
  disabled?: () => boolean
}

type GroupDef = {
  key: string
  label: string
  fields: FieldDef[]
}

const groups: GroupDef[] = [
  {
    key: 'grid',
    label: 'Geometry',
    fields: [
      { key: 'gridX' },
      { key: 'gridY' },
      { key: 'minDistX' },
      { key: 'minDistY' },
      { key: 'boxZone' },
      { key: 'letOffest' },
      { key: 'curveControl' },
    ],
  },
  {
    key: 'penalties',
    label: 'Fitness Penalties',
    fields: [
      { key: 'crossPenalty' },
      { key: 'overPenalty' },
      { key: 'reversePenalty' },
      { key: 'areaPenalty' },
      { key: 'totalDistPenalty' },
      { key: 'arPenalty' },
      { key: 'arMax' },
      { key: 'totalCrossPenalty' },
      { key: 'totalOverPenalty' },
      { key: 'totalCollisionPenalty' },
      { key: 'totalSSCPenalty' },
      { key: 'misalignedSSPenalty' },
      { key: 'misalignedFirstPenalty' },
    ],
  },
  {
    key: 'mws',
    label: 'Mutations',
    fields: [
      { key: 'mutate' },
      { key: 'mutWeightQuadrant' },
      { key: 'mutWeightSingle' },
      { key: 'mutWeightChildren' },
      { key: 'maxChildren' },
      { key: 'mutWeightParents' },
      { key: 'maxParents' },
      { key: 'mutWeightSwapSibling' },
      { key: 'mutWeightSwapRandom' },
      { key: 'mutWeightSwapInRow' },
      { key: 'mutWeightSwapInCol' },
      { key: 'mutWeightShiftRow' },
      { key: 'mutWeightShiftCol' },
    ],
  },
  {
    key: 'ga',
    label: 'Genetic Algorithm',
    fields: [
      { key: 'deterministic' },
      { key: 'seed', wideRow: true, disabled: () => !cfg.value.deterministic },
      { key: 'popSize' },
      { key: 'generations' },
      { key: 'stop' },
      { key: 'mutationRate' },
      { key: 'crossoverRate' },
      { key: 'crossoverMix' },
      { key: 'crossWeightRandom' },
      { key: 'crossWeightStruct' },
      { key: 'tournamentSize' },
      { key: 'diversityBoost' },
      { key: 'stagnationThreshold' },
      { key: 'stagnationRate' },
      { key: 'crowdingTieBreak' },
    ],
  },
  {
    key: 'initial',
    label: 'Initial Population',
    fields: [{ key: 'useDagre' }, { key: 'useSimpleFlow' }, { key: 'useInput' }],
  },
  {
    key: 'run',
    label: 'Run Settings',
    fields: [
      { key: 'logProgressInterval' },
      { key: 'logProgress' },
      { key: 'logInfo' },
      { key: 'writeSvg' },
      { key: 'showStraightLines' },
      { key: 'writeJson' },
      { key: 'removeLineSegments' },
      { key: 'normalize' },
      { key: 'normalizeExport' },
      { key: 'ignoreOrphans' },
      { key: 'keepGroups' },
    ],
  },
]

function isGroupNonDefault(fields: FieldDef[]): boolean {
  return fields.some((f) => isNonDefault(f.key))
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
          @click="copyConfig" />
        <Button
          icon="pi pi-clipboard"
          size="small"
          severity="secondary"
          text
          v-tip.top="'Paste config JSON'"
          @click="pasteConfig" />
        <Button
          icon="pi pi-chevron-right"
          size="small"
          severity="secondary"
          text
          v-tip.top="'Copy CLI command'"
          @click="copyCli" />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          size="small"
          :severity="isConfigDefault ? 'secondary' : 'warning'"
          text
          @click="store.resetConfig()" />
      </div>
    </div>

    <Accordion :value="[]" multiple class="accordion">
      <AccordionPanel v-for="group in groups" :key="group.key" :value="group.key">
        <AccordionHeader :class="{ 'non-default': isGroupNonDefault(group.fields) }">
          {{ group.label }}
        </AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <template v-for="f in group.fields" :key="f.key">
              <!-- wide-row special case (seed) -->
              <div v-if="f.wideRow" class="wide-row">
                <label
                  :class="{ 'non-default': isNonDefault(f.key) }"
                  @click="isNonDefault(f.key) && resetProp(f.key)"
                  >{{ f.key }}</label
                >
                <InputNumber
                  :model-value="cfgNum(f.key)"
                  @update:model-value="setCfgNum(f.key, $event!)"
                  v-bind="numProps(f.key)"
                  style="width: 120px"
                  size="small"
                  :disabled="f.disabled?.()"
                  v-tip.right="configTip(f.key)"
                  @keydown="handleShiftKey($event, f.key)" />
              </div>
              <!-- boolean toggle -->
              <template v-else-if="isBoolean(f.key)">
                <label
                  :class="{ 'non-default': isNonDefault(f.key) }"
                  @click="isNonDefault(f.key) && resetProp(f.key)"
                  >{{ f.key }}</label
                >
                <ToggleSwitch
                  :model-value="cfgBool(f.key)"
                  @update:model-value="setCfgBool(f.key, $event)"
                  v-tip.right="configTip(f.key)" />
              </template>
              <!-- numeric input with optional hl-dot -->
              <template v-else>
                <label
                  :class="{ 'non-default': isNonDefault(f.key) }"
                  @click="isNonDefault(f.key) && resetProp(f.key)"
                  >{{ f.key }}</label
                >
                <div class="field-with-dot">
                  <InputNumber
                    :model-value="cfgNum(f.key)"
                    @update:model-value="setCfgNum(f.key, $event!)"
                    v-bind="numProps(f.key)"
                    size="small"
                    v-tip.right="configTip(f.key)"
                    @keydown="handleShiftKey($event, f.key)" />
                  <span v-if="isHighlighted(configFeatureTags[f.key] ?? [])" class="hl-dot" />
                </div>
              </template>
            </template>
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
              v-tip.right="'Post stats every N evaluations'" />
            <label>topN</label>
            <InputNumber
              v-model="topN"
              :min="1"
              :max="100"
              size="small"
              v-tip.right="'Number of top candidates to track and preview'" />
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
  gap: 0.5rem 0.75rem;
  align-items: center;
  justify-items: right;
  font-size: 0.8rem;
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.wide-row {
  display: grid;
  grid-template-columns: auto 120px;
  grid-column: 1 / -1;
  gap: 0.4rem 0.75rem;
  align-items: center;
  justify-items: right;
  font-size: 0.8rem;
}

.fields-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}

.fields-grid label.non-default {
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

.fields-grid label.non-default::before {
  content: '*';
  margin-right: 0.25rem;
}

.fields-grid:deep(.p-inputnumber > *) {
  width: 80px;
}

.fields-grid .field-with-dot {
  justify-self: right;
}

.accordion {
  --p-accordion-header-font-weight: initial;
  font-size: 15px;
}

.field-with-dot {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hl-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--p-primary-400);
  flex-shrink: 0;
  position: relative;
  margin-left: -9px;
  top: -1.5px;
  left: 12px;
}
</style>
