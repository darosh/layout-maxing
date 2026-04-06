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
const {
  config: cfg,
  progressInterval,
  svgInterval,
  topN,
  allTimeTop,
  isConfigDefault,
} = storeToRefs(store)

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

    <Accordion :value="[]" multiple>
      <AccordionPanel value="grid">
        <AccordionHeader>Grid &amp; Spacing</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>gridX</label>
            <InputNumber
              v-model="cfg.gridX"
              v-bind="numProps('gridX')"
              size="small"
              v-tip.right="configMeta.gridX[4]"
            />
            <label>gridY</label>
            <InputNumber
              v-model="cfg.gridY"
              v-bind="numProps('gridY')"
              size="small"
              v-tip.right="configMeta.gridY[4]"
            />
            <label>minDistX</label>
            <InputNumber
              v-model="cfg.minDistX"
              v-bind="numProps('minDistX')"
              size="small"
              v-tip.right="configMeta.minDistX[4]"
            />
            <label>minDistY</label>
            <InputNumber
              v-model="cfg.minDistY"
              v-bind="numProps('minDistY')"
              size="small"
              v-tip.right="configMeta.minDistY[4]"
            />
            <label>boxZone</label>
            <InputNumber
              v-model="cfg.boxZone"
              v-bind="numProps('boxZone')"
              size="small"
              v-tip.right="configMeta.boxZone[4]"
            />
            <label>letOffset</label>
            <InputNumber
              v-model="cfg.letOffest"
              v-bind="numProps('letOffest')"
              size="small"
              v-tip.right="configMeta.letOffest[4]"
            />
            <label>curveControl</label>
            <InputNumber
              v-model="cfg.curveControl"
              v-bind="numProps('curveControl')"
              size="small"
              v-tip.right="configMeta.curveControl[4]"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="penalties">
        <AccordionHeader>Fitness Penalties</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>crossPenalty</label>
            <InputNumber
              v-model="cfg.crossPenalty"
              v-bind="numProps('crossPenalty')"
              size="small"
              v-tip.right="configMeta.crossPenalty[4]"
            />
            <label>overPenalty</label>
            <InputNumber
              v-model="cfg.overPenalty"
              v-bind="numProps('overPenalty')"
              size="small"
              v-tip.right="configMeta.overPenalty[4]"
            />
            <label>reversePenalty</label>
            <InputNumber
              v-model="cfg.reversePenalty"
              v-bind="numProps('reversePenalty')"
              size="small"
              v-tip.right="configMeta.reversePenalty[4]"
            />
            <label>areaPenalty</label>
            <InputNumber
              v-model="cfg.areaPenalty"
              v-bind="numProps('areaPenalty')"
              size="small"
              v-tip.right="configMeta.areaPenalty[4]"
            />
            <label>arPenalty</label>
            <InputNumber
              v-model="cfg.arPenalty"
              v-bind="numProps('arPenalty')"
              size="small"
              v-tip.right="configMeta.arPenalty[4]"
            />
            <label>arMax</label>
            <InputNumber
              v-model="cfg.arMax"
              v-bind="numProps('arMax')"
              size="small"
              v-tip.right="configMeta.arMax[4]"
            />
            <label>totalCrossPenalty</label>
            <InputNumber
              v-model="cfg.totalCrossPenalty"
              v-bind="numProps('totalCrossPenalty')"
              size="small"
              v-tip.right="configMeta.totalCrossPenalty[4]"
            />
            <label>totalOverPenalty</label>
            <InputNumber
              v-model="cfg.totalOverPenalty"
              v-bind="numProps('totalOverPenalty')"
              size="small"
              v-tip.right="configMeta.totalOverPenalty[4]"
            />
            <label>totalCollisionPenalty</label>
            <InputNumber
              v-model="cfg.totalCollisionPenalty"
              v-bind="numProps('totalCollisionPenalty')"
              size="small"
              v-tip.right="configMeta.totalCollisionPenalty[4]"
            />
            <label>totalSSCPenalty</label>
            <InputNumber
              v-model="cfg.totalSSCPenalty"
              v-bind="numProps('totalSSCPenalty')"
              size="small"
              v-tip.right="configMeta.totalSSCPenalty[4]"
            />
            <label>misalignedSSPenalty</label>
            <InputNumber
              v-model="cfg.misalignedSSPenalty"
              v-bind="numProps('misalignedSSPenalty')"
              size="small"
              v-tip.right="configMeta.misalignedSSPenalty[4]"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="ga">
        <AccordionHeader>GA Parameters</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>popSize</label>
            <InputNumber
              v-model="cfg.popSize"
              v-bind="numProps('popSize')"
              size="small"
              v-tip.right="configMeta.popSize[4]"
            />
            <label>generations</label>
            <InputNumber
              v-model="cfg.generations"
              v-bind="numProps('generations')"
              size="small"
              v-tip.right="configMeta.generations[4]"
            />
            <label>stop</label>
            <InputNumber
              v-model="cfg.stop"
              v-bind="numProps('stop')"
              size="small"
              v-tip.right="configMeta.stop[4]"
            />
            <label>mutationRate</label>
            <InputNumber
              v-model="cfg.mutationRate"
              v-bind="numProps('mutationRate')"
              size="small"
              v-tip.right="configMeta.mutationRate[4]"
            />
            <label>crossoverRate</label>
            <InputNumber
              v-model="cfg.crossoverRate"
              v-bind="numProps('crossoverRate')"
              size="small"
              v-tip.right="configMeta.crossoverRate[4]"
            />
            <label>crossoverMix</label>
            <InputNumber
              v-model="cfg.crossoverMix"
              v-bind="numProps('crossoverMix')"
              size="small"
              v-tip.right="configMeta.crossoverMix[4]"
            />
            <label>tournamentSize</label>
            <InputNumber
              v-model="cfg.tournamentSize"
              v-bind="numProps('tournamentSize')"
              size="small"
              v-tip.right="configMeta.tournamentSize[4]"
            />
            <label>mutate</label>
            <InputNumber
              v-model="cfg.mutate"
              v-bind="numProps('mutate')"
              size="small"
              v-tip.right="configMeta.mutate[4]"
            />
            <label>maxChildren</label>
            <InputNumber
              v-model="cfg.maxChildren"
              v-bind="numProps('maxChildren')"
              size="small"
              v-tip.right="configMeta.maxChildren[4]"
            />
            <label>maxParents</label>
            <InputNumber
              v-model="cfg.maxParents"
              v-bind="numProps('maxParents')"
              size="small"
              v-tip.right="configMeta.maxParents[4]"
            />
            <label>mutWeightQuadrant</label>
            <InputNumber
              v-model="cfg.mutWeightQuadrant"
              v-bind="numProps('mutWeightQuadrant')"
              size="small"
              v-tip.right="configMeta.mutWeightQuadrant[4]"
            />
            <label>mutWeightSingle</label>
            <InputNumber
              v-model="cfg.mutWeightSingle"
              v-bind="numProps('mutWeightSingle')"
              size="small"
              v-tip.right="configMeta.mutWeightSingle[4]"
            />
            <label>mutWeightChildren</label>
            <InputNumber
              v-model="cfg.mutWeightChildren"
              v-bind="numProps('mutWeightChildren')"
              size="small"
              v-tip.right="configMeta.mutWeightChildren[4]"
            />
            <label>mutWeightParents</label>
            <InputNumber
              v-model="cfg.mutWeightParents"
              v-bind="numProps('mutWeightParents')"
              size="small"
              v-tip.right="configMeta.mutWeightParents[4]"
            />
            <label>mutWeightSwapSibling</label>
            <InputNumber
              v-model="cfg.mutWeightSwapSibling"
              v-bind="numProps('mutWeightSwapSibling')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapSibling[4]"
            />
            <label>mutWeightSwapRandom</label>
            <InputNumber
              v-model="cfg.mutWeightSwapRandom"
              v-bind="numProps('mutWeightSwapRandom')"
              size="small"
              v-tip.right="configMeta.mutWeightSwapRandom[4]"
            />
          </div>
          <div class="toggles-grid">
            <label>useDagre</label>
            <ToggleSwitch v-model="cfg.useDagre" v-tip.right="configMeta.useDagre[4]" />
            <label>useInput</label>
            <ToggleSwitch v-model="cfg.useInput" v-tip.right="configMeta.useInput[4]" />
            <label>showStraightLines</label>
            <ToggleSwitch
              v-model="cfg.showStraightLines"
              v-tip.right="configMeta.showStraightLines[4]"
            />
            <label>deterministic</label>
            <ToggleSwitch v-model="cfg.deterministic" v-tip.right="configMeta.deterministic[4]" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <!-- Run settings (part of Config) -->
      <AccordionPanel value="run">
        <AccordionHeader>Run Settings</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>logProgressInterval</label>
            <InputNumber
              v-model="cfg.logProgressInterval"
              :min="200"
              :max="60000"
              :step="500"
              size="small"
              v-tip.right="configMeta.logProgressInterval[4]"
            />
          </div>
          <div class="toggles-grid">
            <label>logInfo</label>
            <ToggleSwitch v-model="cfg.logInfo" v-tip.right="configMeta.logInfo[4]" />
            <label>logProgress</label>
            <ToggleSwitch v-model="cfg.logProgress" v-tip.right="configMeta.logProgress[4]" />
            <label>writeSvg</label>
            <ToggleSwitch v-model="cfg.writeSvg" v-tip.right="configMeta.writeSvg[4]" />
            <label>writeJson</label>
            <ToggleSwitch v-model="cfg.writeJson" v-tip.right="configMeta.writeJson[4]" />
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
            <label>svgInterval</label>
            <InputNumber
              v-model="svgInterval"
              :min="200"
              :max="10000"
              size="small"
              v-tip.right="'Post SVG update every N milliseconds'"
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
            <label>allTimeTop</label>
            <ToggleSwitch
              v-model="allTimeTop"
              v-tip.right="'Show best across all time (on) or current population only (off)'"
            />
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
  --p-accordion-header-padding: 0.5rem 0.75rem;
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
}

.fields-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}

.fields-grid:deep(.p-inputnumber > *) {
  width: 80px;
}

.toggles-grid {
  display: grid;
  grid-template-columns: auto 80px;
  gap: 0.5rem 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  margin-top: 0.75rem;
  justify-items: right;
}

.toggles-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}
</style>
