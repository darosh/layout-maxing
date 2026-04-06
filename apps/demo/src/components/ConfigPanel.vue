<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import { useOptimizerStore } from '@/stores/optimizer'

const store = useOptimizerStore()
// storeToRefs extracts reactive refs — v-model on cfg.X correctly reads/writes the store
const { config: cfg, progressInterval, svgInterval, topN, allTimeTop } = storeToRefs(store)
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <span class="config-title">Configuration</span>
      <Button
        label="Reset"
        icon="pi pi-refresh"
        size="small"
        severity="secondary"
        text
        @click="store.resetConfig()"
      />
    </div>

    <Accordion :value="[]" multiple>
      <AccordionPanel value="grid">
        <AccordionHeader>Grid &amp; Spacing</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>gridX</label>
            <InputNumber v-model="cfg.gridX" :min="1" :max="200" size="small" />
            <label>gridY</label>
            <InputNumber v-model="cfg.gridY" :min="1" :max="200" size="small" />
            <label>minDistX</label>
            <InputNumber v-model="cfg.minDistX" :min="0" :max="200" size="small" />
            <label>minDistY</label>
            <InputNumber v-model="cfg.minDistY" :min="0" :max="200" size="small" />
            <label>boxZone</label>
            <InputNumber v-model="cfg.boxZone" :min="0" :max="50" size="small" />
            <label>letOffset</label>
            <InputNumber v-model="cfg.letOffest" :min="0" :max="50" :step="0.5" size="small" />
            <label>curveControl</label>
            <InputNumber v-model="cfg.curveControl" :min="0" :max="100" size="small" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="penalties">
        <AccordionHeader>Fitness Penalties</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>crossPenalty</label>
            <InputNumber v-model="cfg.crossPenalty" :min="0" :max="20" :step="0.1" size="small" />
            <label>overPenalty</label>
            <InputNumber v-model="cfg.overPenalty" :min="0" :max="20" :step="0.1" size="small" />
            <label>reversePenalty</label>
            <InputNumber v-model="cfg.reversePenalty" :min="0" :max="20" :step="0.1" size="small" />
            <label>areaPenalty</label>
            <InputNumber v-model="cfg.areaPenalty" :min="0" :max="20" :step="0.1" size="small" />
            <label>totalCross×</label>
            <InputNumber
              v-model="cfg.totalCrossPenalty"
              :min="1"
              :max="2"
              :step="0.01"
              :minFractionDigits="2"
              size="small"
            />
            <label>totalOver×</label>
            <InputNumber
              v-model="cfg.totalOverPenalty"
              :min="1"
              :max="2"
              :step="0.01"
              :minFractionDigits="2"
              size="small"
            />
            <label>totalCollision×</label>
            <InputNumber
              v-model="cfg.totalCollisionPenalty"
              :min="1"
              :max="2"
              :step="0.01"
              :minFractionDigits="2"
              size="small"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="ga">
        <AccordionHeader>GA Parameters</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label>popSize</label>
            <InputNumber v-model="cfg.popSize" :min="10" :max="1000" size="small" />
            <label>generations</label>
            <InputNumber v-model="cfg.generations" :min="100" :max="1000000" size="small" />
            <label>stop</label>
            <InputNumber v-model="cfg.stop" :min="100" :max="100000" size="small" />
            <label>mutationRate</label>
            <InputNumber
              v-model="cfg.mutationRate"
              :min="0"
              :max="1"
              :step="0.001"
              :minFractionDigits="3"
              size="small"
            />
            <label>crossoverRate</label>
            <InputNumber
              v-model="cfg.crossoverRate"
              :min="0"
              :max="1"
              :step="0.01"
              :minFractionDigits="2"
              size="small"
            />
            <label>crossoverMix</label>
            <InputNumber
              v-model="cfg.crossoverMix"
              :min="0"
              :max="1"
              :step="0.01"
              :minFractionDigits="2"
              size="small"
            />
            <label>tournamentSize</label>
            <InputNumber
              v-model="cfg.tournamentSize"
              :min="0"
              :max="1"
              :minFractionDigits="1"
              :step="0.1"
              size="small"
            />
            <label>mutate</label>
            <InputNumber
              v-model="cfg.mutate"
              :min="0"
              :max="10"
              :minFractionDigits="1"
              :step="0.1"
              size="small"
            />
            <label>maxChildren</label>
            <InputNumber v-model="cfg.maxChildren" :min="1" :max="20" size="small" />
            <label>maxParents</label>
            <InputNumber v-model="cfg.maxParents" :min="1" :max="20" size="small" />
            <label>weightQuadrant</label>
            <InputNumber v-model="cfg.mutWeightQuadrant" :min="0" :max="100" size="small" />
            <label>weightSingle</label>
            <InputNumber v-model="cfg.mutWeightSingle" :min="0" :max="100" size="small" />
            <label>weightChildren</label>
            <InputNumber v-model="cfg.mutWeightChildren" :min="0" :max="100" size="small" />
            <label>weightParents</label>
            <InputNumber v-model="cfg.mutWeightParents" :min="0" :max="100" size="small" />
            <label>weightSwapSibling</label>
            <InputNumber v-model="cfg.mutWeightSwapSibling" :min="0" :max="100" size="small" />
            <label>weightSwapRandom</label>
            <InputNumber v-model="cfg.mutWeightSwapRandom" :min="0" :max="100" size="small" />
          </div>
          <div class="toggles-grid">
            <label>useDagre</label>
            <ToggleSwitch v-model="cfg.useDagre" />
            <label>useInput</label>
            <ToggleSwitch v-model="cfg.useInput" />
            <label>showStraightLines</label>
            <ToggleSwitch v-model="cfg.showStraightLines" />
            <label>deterministic</label>
            <ToggleSwitch v-model="cfg.deterministic" />
          </div>
        </AccordionContent>
      </AccordionPanel>

      <!-- Run settings (not part of Config) -->
      <AccordionPanel value="run">
        <AccordionHeader>Run Settings</AccordionHeader>
        <AccordionContent>
          <div class="fields-grid">
            <label title="Post stats every N evaluations">progressInterval</label>
            <InputNumber v-model="progressInterval" :min="200" :max="10000" size="small" />
            <label title="Post SVG update every N milliseconds">svgInterval</label>
            <InputNumber v-model="svgInterval" :min="200" :max="10000" size="small" />
            <label title="Number of top candidates to track and preview">topN</label>
            <InputNumber v-model="topN" :min="1" :max="100" size="small" />
            <label title="Show best across all time (on) or current population only (off)"
              >allTimeTop</label
            >
            <ToggleSwitch v-model="allTimeTop" />
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
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

.config-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-surface-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  width: 120px;
}

.toggles-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem 0.75rem;
  align-items: center;
  font-size: 0.8rem;
  margin-top: 0.75rem;
}

.toggles-grid label {
  color: var(--p-surface-300);
  font-family: monospace;
}
</style>
