# Layout-Maxing Optimization Plan

Benchmark before/after every change: `bash scripts/bench-run.sh` then `bash scripts/bench-compare.sh`.
Baseline is run 1 (git `aed9377`): e1=3933/1.44s, e2=24366/22.93s, e3=11039/2.30s, e4=33529/3.59s.

---

## 0. Fix OOM crash on example-5 (the-voice.rnbopat)

**Repro:**
```bash
cd packages/layout-maxing-cli
deno run --allow-all --sloppy-imports src/index.ts layout \
  tests/fixtures/the-voice.rnbopat /tmp/voice-out.json --passes 1 --preset Clustered
# → Fatal JavaScript out of memory after ~142s
```

The clustered GA accumulates too many genome objects over many generations. Each individual in the population is a full `Box[]` array that gets cloned per offspring. With a large patcher (~700+ boxes) and many generations, V8 heap exhausts.

**Likely fixes (in order of effort):**
- [x] Root cause: `buildGenerationSnapshot` stored the full `population` (20×700 Box objects) in every snapshot, and `monitor.snapshots` grew unboundedly. Fix: clear `snapshot.population = undefined` immediately after `onGenerationEnd` in `genetic.ts`. Confirmed: run now completes in ~10min instead of OOM-crashing.

---

## 1. Worker init protocol — send lines+cfg once, positions only per eval

**What:** Currently each fitness eval sends the full `layouts` (positions) + `lines` (graph topology, constant) + `cfg` (constant) via structured-clone. For large patches, `lines` is large and never changes during a run.

**Files:**
- `packages/layout-maxing-cli/src/worker.ts` — add `init`/`eval` message protocol
- `packages/layout-maxing-cli/src/index.ts` — call `initWorkers(lines, cfg)` once after reading file; `getFitness` sends only layouts
- `apps/demo/src/workers/fitness.worker.ts` — same init/eval split for the app

**Expected win:** Reduces structured-clone payload per eval from `[layouts, lines, cfg]` to `[layouts]` only. Biggest benefit on large patches with many lines.

**Must not change:** fitness function or any algorithm — purely worker protocol.

- [ ] Implement in CLI worker + index.ts
- [ ] Implement in app worker + wherever the app creates the fitness worker
- [ ] Bench run, compare scores (should be identical), compare times

---

## 2. Precompute SSC / topology data outside fitness()

**What:** Every `fitness()` call recomputes `outgoingCount`, `incomingCount`, `sscSourceIds`, and the `sscByChild` topology from scratch. These depend only on `lines` (graph topology) which never changes during a GA run.

**Files:** `packages/layout-maxing/src/fitness.ts`

**Approach:** Export `precomputeTopology(lines, boxes)` returning `{ sscSourceIds, sscByChildIds }`. Add optional `topology` param to `fitness()` — if provided, skip the O(E+N) recomputation.  Worker stores the precomputed topology at init time and passes it per eval.

**Expected win:** Saves ~600 map operations per eval (O(E+N) for the-synth with 165 lines, 100 boxes).

- [ ] Export `precomputeTopology` from fitness.ts
- [ ] Add optional `topology` param to `fitness()`
- [ ] Pass precomputed topology from worker
- [ ] Bench and compare

---

## 3. matchEntity O(N²) → O(N) in crossover

**What:** `crossover()` and `crossoverStructural()` in `mutation.ts` call `.find()` on `p2Entities` for every entity — O(N) per entity, O(N²) total per crossover call.

**File:** `packages/layout-maxing/src/mutation.ts`

**Approach:** Build `Map<groupIdx, entity>` and `Map<boxIndex, entity>` from `p2Entities` once before the loop. Replace `.find()` with direct map lookup.

**Must not change:** which entity is matched (same lookup logic, just faster).

- [ ] Build lookup maps before entity loop in `crossover()`
- [ ] Same fix in `crossoverStructural()`
- [ ] Bench and compare

---

## 4. AABB pre-filter for line-box collision in fitness()

**What:** For each line, iterates all boxes calling `boxLineCollision()`. Most boxes are nowhere near the line.

**File:** `packages/layout-maxing/src/fitness.ts`

**Approach:** Compute line bounding box `[lx0, ly0, lx1, ly1]` once per line. Skip boxes whose AABB doesn't overlap the line AABB before calling `boxLineCollision()`.

**Must not change:** which collisions are detected (AABB overlap is a necessary condition for line-box collision).

- [ ] Add AABB guard before `boxLineCollision` call
- [ ] Bench and compare

---

## 5. getIntersectionArea early-exit

**What:** `getIntersectionArea()` in `geometry.ts` always computes both `xOverlap` and `yOverlap`. If `xOverlap === 0`, no need to compute `yOverlap`.

**File:** `packages/layout-maxing/src/geometry.ts`

**Change:** Return 0 early if `xOverlap === 0`.

- [ ] Add early return
- [ ] Bench and compare (likely small win, easy to do)

---

## Notes

- All optimizations must be behavior-neutral: scores should not change by more than ~0.5% (natural stochastic variance). The `⚠` flag in bench-compare.sh catches regressions.
- CLI (`packages/layout-maxing-cli`) and app (`apps/demo`) must be updated together for any worker protocol changes.
- Bench scripts: `scripts/bench-run.sh` / `scripts/bench-compare.sh`. Results in `temp/runs/`.
- Adaptive bezierLength (steps proportional to chord length) was tried and reverted — adds overhead with no benefit since most connections in real patches exceed the 150px threshold where 30 steps is triggered anyway.
