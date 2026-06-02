// Synergy groups and their parameter ranges.
//
// Each group defines a set of co-varying params and a min/max/step for each.
// Ranges are intentionally a bit wider than defaults to surface non-linear regions.
// Param keys must match `Config` fields in `layout-maxing`.

import type { Config } from 'layout-maxing'

export type Range = { min: number; max: number; integer?: boolean }
export type GroupParams = Record<string, Range>

export interface GroupDef {
  name: 'stagnation' | 'niching' | 'cluster' | 'mutweights' | 'fitness'
  // Params co-varied within the group.
  params: GroupParams
  // Static config the group always sets (e.g. nichingEnabled=true for niching group).
  fixed: Partial<Config>
  // True → only applies to clustered examples.
  clusteredOnly: boolean
}

export const GROUPS: GroupDef[] = [
  {
    name: 'stagnation',
    fixed: {},
    clusteredOnly: false,
    params: {
      popSize: { min: 5, max: 80, integer: true },
      mutationRate: { min: 0.3, max: 1.0 },
      stagnationThreshold: { min: 0, max: 80, integer: true },
      stagnationRate: { min: 1.0, max: 1.5 },
      diversityBoost: { min: 0, max: 1.5 },
      diversityBoostCap: { min: 1, max: 4 },
    },
  },
  {
    name: 'niching',
    fixed: { nichingEnabled: true },
    clusteredOnly: false,
    params: {
      popSize: { min: 10, max: 80, integer: true },
      nichingRadius: { min: 0.1, max: 1.5 },
      nichingExponent: { min: 0.5, max: 2.5 },
      eliteSize: { min: 1, max: 8, integer: true },
    },
  },
  {
    name: 'cluster',
    fixed: { generations: 10000, stop: 499 },
    clusteredOnly: true,
    params: {
      popSize: { min: 5, max: 40, integer: true },
      cluster: { min: 3, max: 20, integer: true },
      clusterMax: { min: 0, max: 30, integer: true },
      clusterPolishFraction: { min: 0.05, max: 0.5 },
      clusterPolishMutate: { min: 0.05, max: 0.6 },
    },
  },
  {
    name: 'mutweights',
    fixed: {},
    clusteredOnly: false,
    // Sampled as Dirichlet draw normalized to sum=100 (so absolute scale matches defaults).
    params: {
      mutWeightQuadrant: { min: 0, max: 30 },
      mutWeightSingle: { min: 0, max: 30 },
      mutWeightChildren: { min: 0, max: 30 },
      mutWeightParents: { min: 0, max: 30 },
      mutWeightSwapSibling: { min: 0, max: 30 },
      mutWeightSwapRandom: { min: 0, max: 30 },
      mutWeightSwapInRow: { min: 0, max: 30 },
      mutWeightSwapInCol: { min: 0, max: 30 },
      mutWeightShiftRow: { min: 0, max: 30 },
      mutWeightShiftCol: { min: 0, max: 30 },
    },
  },
  {
    name: 'fitness',
    fixed: {},
    clusteredOnly: false,
    params: {
      crossPenalty: { min: 0.5, max: 4 },
      overPenalty: { min: 1, max: 12 },
      totalCrossPenalty: { min: 1.0, max: 1.1 },
      areaPenalty: { min: 0.5, max: 3 },
      viewExponent: { min: 0.5, max: 1.5 },
    },
  },
]

export function findGroup(name: string): GroupDef | undefined {
  return GROUPS.find((g) => g.name === name)
}

// Presets to sweep (just the named ones from layout-maxing PRESETS that make sense).
export const PRESET_NAMES_NON_CLUSTERED = ['Default', 'Niching', 'NichingFast', 'Fast', 'Medium']
export const PRESET_NAMES_CLUSTERED = ['Clustered', 'ClusteredNiching', 'ClusteredNichingStable']
