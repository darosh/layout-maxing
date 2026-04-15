# GA Review & Improvement Plan

Cross-session work tracker. Each item has target anchors (fn name + code pattern) so it survives line number changes.

---

## Bugs

- [x] **B1 — `spare` leaks across passes**
  File: `packages/layout-maxing/src/genetic.ts`
  Anchor: `let spare: number | null = null` (module-level, before `randGaussian`)
  Issue: Box-Muller spare value persists across `runGenetic` calls. With `deterministic=true`, pass N+1 consumes pass N's leftover → non-reproducible results.
  Fix: Reset `spare = null` at start of `runGenetic`, or move it into a closure.

- [x] **B2 — `maxX`/`maxY` zero guard**
  File: `packages/layout-maxing/src/genetic.ts`
  Anchor: inside `mutateChild`, lines `const maxX = Math.round((0.5 * mutateX) / cfg.gridX)` and same for `maxY`
  Issue: If viewport is tiny (all boxes at origin before first fixOverlaps), `maxX` or `maxY` can be 0. `randGausInt(1, 0, rand)` called with min>max → nonsense result.
  Fix: `const safeMaxX = Math.max(maxX, 1)` before calling `randGausInt`.

- [x] **B3 — `fixOverlaps` asymmetric final rounding**
  File: `packages/layout-maxing/src/layout.ts`
  Anchor: inside `fixOverlaps`, the "Final grid snap" comment block — `Math.ceil(e.x / cfg.gridX)` vs `Math.round(e.y / cfg.gridY)`
  Issue: x uses ceil (always rounds up), y uses round → layout drifts rightward each repair call.
  Fix: Use `Math.round` for both axes in the final snap.

- [x] **B4 — `simpleFlow` off-by-one (first box at x=gridX instead of 0)**
  File: `packages/layout-maxing/src/layout.ts`
  Anchor: `simpleFlow` fn, `const last = cols[l.depth!].at(-1) ?? { x: 0, width: 0 }`
  Issue: First box placed at `0 + 0 + gridX = gridX`. Should start at origin.
  Fix: Sentinel `{ x: -cfg.gridX, width: 0 }` or change formula to `last.x + last.width + (cols[...].length ? cfg.gridX : 0)`.

---

## GA Inefficiencies

- [x] **G1 — `view` exponent vanishes for large patches**
  File: `packages/layout-maxing/src/fitness.ts`
  Anchor: `view ** (1 / layouts.length)` in the `score` return expression
  Issue: For n=100, exponent=0.01 → `view^0.01 ≈ 1` regardless of viewport size. View pressure disappears.
  Fix: Add `viewExponent` config param (default `1/20` = 0.05); use `view ** c.viewExponent`.
  Also update `packages/layout-maxing/src/config.ts` — add `viewExponent` to `Config` interface and `configMeta`.

- [x] **G2 — Multipass doesn't feed globalBest into next pass**
  File: `packages/layout-maxing/src/core.ts`
  Anchor: `for (let pass = 0; pass < numPasses; pass++)` loop; `startingLayouts` is never updated
  Issue: Each pass starts from same seeds with different RNG. Best from pass N never used as seed for pass N+1.
  Fix: After each pass, if `result` is new globalBest, push `globalBest` into `startingLayouts` (replacing or appending) so pass N+1 can refine it.

- [ ] **G4 — `dagreFlow` only uses TB direction**
  File: `packages/layout-maxing/src/core.ts`
  Anchor: `(['TB' /*'LR', 'BT', 'RL'*/] as const).map(...)` in the `useDagre` block
  Issue: 3 directions commented out. LR especially useful for horizontally-oriented patches.
  Fix: Add `useDagreLR` boolean config (default false), add it as second dagre seed when enabled.

- [ ] **G5 — No inlet/outlet-side-aware initial layout**
  File: `packages/layout-maxing/src/core.ts` + `packages/layout-maxing/src/layout.ts`
  Anchor: after `dagreFlow` block, before `simpleFlow` block
  Issue: Dagre TB always places parents above children regardless of outlet/inlet index distribution. Patches with many non-first outlets would benefit from LR layout.
  Fix: Add auto-direction heuristic — compute ratio of lines where `source[1] > 0 || destination[1] > 0`; if >50%, use LR as the primary dagre direction. New fn `detectPreferredFlowDirection(lines): 'TB' | 'LR'` in `layout.ts`.

---

## Performance

- [ ] **P1 — `toEntities` + `buildBoxEntityIndex` per mutation call**
  File: `packages/layout-maxing/src/genetic.ts`
  Anchor: inside `mutateChild` fn — first two lines `const entities = toEntities(child)` and `const boxEntityMap = buildBoxEntityIndex(entities)`
  Issue: Called for every offspring every generation (popSize × gens). Pre-computable once per generation.
  Fix: Compute `entities` and `boxEntityMap` once per generation outside `mutateChild`, pass as params. Requires signature change.

- [ ] **P2 — `fixOverlaps` (30×O(n²)) per offspring when `repairOffspring=true`**
  File: `packages/layout-maxing/src/layout.ts`
  Anchor: `let iterations = 0; const MAX_ITER = 30` inside `fixOverlaps`
  Issue: For n=100 boxes, 30 × 10K comparisons per child × popSize = 6M comparisons/gen. Major bottleneck.
  Fix: Expose `maxIter` param to `fixOverlaps` (default 30, presets for large patches can pass 5). Also add early-exit if 0 overlaps after first pass.

- [ ] **P3 — `layoutShrinkEntities` fights the optimizer**
  File: `packages/layout-maxing/src/layout.ts`
  Anchor: `layoutShrinkEntities(entities, cfg.gridY)` at the end of `fixOverlaps`
  Issue: Collapses all rows to densely packed after every repair, undoing vertical spacing the GA found. Called each generation when `repairOffspring=true`.
  Fix: Add `shrinkRows` config flag (default false). Only call `layoutShrinkEntities` when `shrinkRows=true` or during initial seeding. Update `config.ts` with entry.

---

## Analytics

- [ ] **A1 — Add `summarizeRun` to monitor**
  File: `packages/layout-maxing/src/monitor.ts`
  Anchor: after `computeDeadWeightMutations` fn
  New fn: `summarizeRun(monitor: RunMonitor, passes?: number): string`
  Outputs:
  - Total gens, gens with improvement, stagnation %
  - Best/worst mutation operator (by improvement rate + total delta)
  - Dead-weight operators
  - Stagnation burst count (count snapshots where `stagnation >= stagnationThreshold`)
  - Optional per-pass summary if called from multi-pass context
  Expose: CLI `--writeSummary` flag prints to stdout. Demo UI shows panel after run.

---

## Presets

- [ ] **Create `packages/layout-maxing/presets/` folder with preset JSONs**

  **`small.json`** (≤20 boxes)
  ```json
  {
    "popSize": 20, "stop": 2000, "passes": 4,
    "repairOffspring": true, "stagnationThreshold": 30,
    "catastropheThreshold": 100, "catastropheFraction": 0.5,
    "useDagre": true, "useSimpleFlow": true
  }
  ```

  **`medium.json`** (21–60 boxes)
  ```json
  {
    "popSize": 30, "stop": 500, "passes": 3,
    "repairOffspring": false, "stagnationThreshold": 20,
    "catastropheThreshold": 60, "catastropheFraction": 0.4,
    "useDagre": true,
    "diversityBoost": 0.8, "diversityBoostCap": 3
  }
  ```

  **`large.json`** (61–200 boxes)
  ```json
  {
    "popSize": 40, "stop": 300, "passes": 2,
    "repairOffspring": false, "stagnationThreshold": 15,
    "catastropheThreshold": 40, "catastropheFraction": 0.3,
    "useDagre": true,
    "viewExponent": 0.05,
    "diversityBoost": 1.0, "diversityBoostCap": 4,
    "mutWeightSwapSibling": 40, "mutWeightChildren": 50
  }
  ```
  (Note: `viewExponent` requires G1 to be implemented first)

  **`fast.json`** (quick preview, any size)
  ```json
  {
    "popSize": 15, "stop": 100, "passes": 1,
    "repairOffspring": false, "generations": 5000
  }
  ```

---

## Suggested Implementation Order

1. B1, B2, B3, B4 — low-risk correctness fixes
2. G1 — `viewExponent` (fixes large patch optimization blind spot)
3. G2 — multipass globalBest seeding (single biggest quality win)
4. P2, P3 — repair performance (biggest speed win for large patches)
5. G4, G5 — better seeds (quality improvement)
6. A1 — analytics summary
7. Presets — after G1 is done (large.json depends on viewExponent)
8. P1 — entity pre-computation (minor, low priority)
