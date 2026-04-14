# genetic algo issues (caveman)

refs by function + snippet (line# decay fast). file = `packages/layout-maxing/src/genetic.ts` unless noted.

priority: **HIGH** = correctness / big perf / big GA win. **LOW** = cleanup, micro-perf, minor.

---

## BUGS

- [x] **HIGH — B1. elite splice returns removed chunk not rest** — `runGenetic`
  snippet: `let populationCopy = [...population].splice(currentBestIdx, 1)` (also 5 more `populationCopy = populationCopy.splice(populationCopy.indexOf(bestBy*), 1)`)
  `splice` returns REMOVED elements. `populationCopy` collapses to 1 elem. all 6 `minBy` pick same individual → elite slots duplicate.
  fix: `const pool = population.filter((_,i)=>i!==currentBestIdx)`; then remove by index (`pool.splice(idx,1)` statement-form, don't reassign).

- [x] **HIGH — B2. `uniqueIndexes` can return [] → tournamentSelect blows up** — `uniqueIndexes`, `tournamentSelect`
  snippet: `const sanitizeCount = Math.min(count, max - min - (exclude ? exclude.length : 0))`
  when `selected` grows large (line `selected.push(i1)` in main loop) sanitizeCount≤0 → `[initial,...rest] = []` → `initial=undefined` → `population[undefined]`. also exclude indexes outside [min,max] over-subtract.
  fix: clamp, handle empty, or filter exclude to in-range first.

- [x] **HIGH — G4. crossover children never mutated** — `runGenetic` main loop
  snippet: `if (rand() < cfg.crossoverRate) { ... } else { ... if (rand() < effectiveMutationRate) mutateChild(...) }`
  standard GA = crossover THEN mutate. current: crossover branch skips mutation entirely → premature convergence.
  fix: apply mutation after crossover w/ same rate gate.

- [x] **LOW — B3. `roulette` all-zero weights silently biases idx 0** — `roulette`
  snippet: `const total = weights.reduce((a, b) => a + b, 0)` then `r = rand() * total`
  total=0 → r=0 → first `r -= 0` → `r<=0` true → return 0.
  fix: guard `if (total<=0) throw` or uniform fallback.

- [x] **LOW — B4. `randGausInt` passes constant as rand** — `randGausInt`
  snippet: `sign * randInt(min, max, () => clamped)`
  works but confusing: magnitude deterministic from single gaussian sample. `min=1`, `maxX` → when clamped≈0.9999 get exactly maxX, boundary ok but hidden.
  fix: inline `sign * (Math.floor(clamped*(max-min+1))+min)` w/ comment.

- [x] **LOW — B5. redundant modulo on entity pick** — `mutateChild`
  snippet: `entities[Math.floor(rand() * entities.length) % entities.length]`
  `floor(rand()*N)` already in `[0,N-1]`. `% N` dead.

- [x] **LOW — B6. `mutateXYOverlap` asymmetric band edge** — `mutateChild`
  snippet: `const x = mxy < 0.5 + half || mutIdx === 8 ? ... : 0`
  with half=0 and mxy===0.5 exactly: x=0 AND y=0 → no-op mutation. rare but wasted child.

- [x] **LOW — B7. dead field `lastMutation`** — newPopulation push
  snippet: `lastMutation: childMutation,` — duplicates `_mutation`, unused elsewhere.

- [x] **LOW — B8. fitness type lie** — `createPopulation`
  snippet: `fitness: undefined as any` — drop or widen type properly.

---

## PERF

- [x] **HIGH — P1. `crowdingDistance` re-sorts whole pop per call** — `crowdingDistance`
  snippet: `const sorted = population.map(...).sort((a,b)=>a.v-b.v)` inside per-candidate tiebreak loop.
  O(N log N) × tourneys × candidates × tiebreaks. cache sort per (generation, prop) or precompute rank array once.

- [x] **HIGH — P3. async-wrap on sync fitness** — createPopulation + main gen loop
  snippet: `fitnessPromises = population.map(async (ind) => { ... ind.fitness = getFitness ? await getFitness(...) : fitness(...) })`
  sync path still pays microtask × popSize × gens. branch: if no `getFitness` run tight sync loop.

- [x] **HIGH — P5. `toEntities` rebuilt per child mutation** — `mutateChild`
  snippet: `const entities = toEntities(child)` — rebuild per child. build once per gen when possible, or after crossover.

- [x] **HIGH — P6. `buildBoxEntityIndex` rebuilt per mutation** — `mutation.ts:mutateWithChildren/mutateWithParents`
  snippet: `const boxEntityMap = buildBoxEntityIndex(entities)` — share across calls in same gen.

- [ ] **LOW — P2. diversity per gen** — `computePopulationDiversity`
  verify cost in `monitor.ts`; if O(N²) use stride sampling or evict stale fingerprints.

- [ ] **LOW — P4. `Math.min(...array)` spread overflow** — main gen loop
  snippet: `const minScore = Math.min(...fitnessValues.map(({ score }) => score))` — popSize >~1e4 blows stack.
  fix: `reduce((m,f)=>f.score<m?f.score:m, Infinity)`.

- [ ] **LOW — P7. elite cloned twice per gen** — main gen loop
  snippet: `bestIndividual = cloneLayouts(population[currentBestIdx].layouts)` AND later `layouts: cloneLayouts(bestIndividual)`. clone only on improvement; reuse ref for elite slot if downstream doesn't mutate.

- [ ] **LOW — P8. `child.find(b=>b.id===childMutatedBoxId)`** — main gen loop
  snippet: `const box = child.find((b) => b.id === childMutatedBoxId)` — linear scan per child for monitoring bookkeeping. build id→box map once per child (or let mutateChild return box ref).

- [ ] **LOW — P9. six `minBy` passes over populationCopy** — main gen loop
  after B1 fix, fuse into single pass computing 6 mins.

---

## GA inefficiencies

- [x] **HIGH — G1. elitism over-greedy** — main gen loop
  7 elites (best + 6 criteria). even after B1 fix, criteria-bests often same ind → redundant. eats popSize exploration budget.
  fix: 1-2 elite + Pareto front sampling; drop redundant criteria slots.

- [x] **HIGH — G2. adaptive operator selection NOT wired** — `mutateChild` + `monitor.runTotals`
  stats tracked (`monitor.runTotals[mut].improvements/attempts/survived`) but `cfg.mutWeight*` never updated. dead telemetry.
  fix: every K gens, reweight via bandit (UCB / probability matching) from improvement rate.

- [x] **HIGH — G5. tournament w/o replacement across whole gen** — main gen loop
  snippet: `selected.push(i1)` then `tournamentSelect(..., selected)` — pool shrinks child-by-child → late children pick from worse residue.
  fix: drop `selected` (tournament w/ replacement is standard) or scope exclusion to within one selection only.

- [ ] **MEDIUM — G3. one-entity mutation per child** — `mutateChild`
  snippet: `const targetEntity = entities[Math.floor(rand() * entities.length)]`
  only 1 entity mutated per child; `effectiveMutate` scales magnitude not count. add per-entity bernoulli for multi-point mutation under stagnation.

- [ ] **MEDIUM — G6. no overlap repair on offspring** — main gen loop
  snippet: `// child = fixOverlaps(child, cfg)` (commented)
  createPop repairs init, offspring don't → inconsistent; invalid geom costs fitness evals.
  decide: repair always OR never; don't half.

- [ ] **MEDIUM — G7. stagnation boosts RATE not MAGNITUDE** — main gen loop
  snippet: `if (cfg.stagnationThreshold > 0 && stagnation >= cfg.stagnationThreshold) { effectiveMutationRate = Math.min(1, effectiveMutationRate * cfg.stagnationRate) }`
  `effectiveMutate` (magnitude) ignored. escape typically needs bigger jumps.
  fix: also scale `effectiveMutate`.

- [ ] **MEDIUM — G10. Pareto underused** — main gen loop
  snippet: `const props = <(keyof Fitness)[]>['score', 'view']`
  alternating objective = poor man's multi-obj; crowding only tiebreaks within prop. switch to NSGA-II non-dominated sort if true multi-obj desired.

- [ ] **LOW — G8. diversity boost half-implemented** — main gen loop
  snippet: `effectiveMutate = cfg.mutate * Math.min(2, boost)` and commented `effectiveMutationRate = Math.min(1, cfg.mutationRate + (1-diversity)*cfg.diversityBoostFactor)`
  arbitrary cap=2; rate branch commented out. finalize or delete.

- [ ] **LOW — G9. no restart / island / catastrophe on deep stagnation** — main gen loop
  only `stop` termination. consider random-restart fraction after N×stagnation.

- [ ] **LOW — G11. crossover offspring never repaired or normalized check** — `crossover*` in `mutation.ts`
  snippet: `if (cfg.normalize) normalizeLayouts(child)` — optional. combined w/ G6 overlap skip, invalid children common.

- [ ] **LOW — G12. low init diversity when startingLayouts small** — `createPopulation`
  snippet: `if (i >= startingLayouts.length && cfg.initialMutation) mutateChild(ind, rand, cfg, cfg.mutate)` — one mutation per clone. scale mutation count w/ clone index or use bigger magnitude.

---

## priority fix order (recommended)
1. B1 elitism splice (silent correctness)
2. G4 crossover+mutate
3. P1 crowding sort cache
4. B2 uniqueIndexes pool exhaustion
5. G2 adaptive weights from existing stats
6. P3 / P5 / P6 async + entity rebuild

## critical files
- `packages/layout-maxing/src/genetic.ts`
- `packages/layout-maxing/src/mutation.ts`
- `packages/layout-maxing/src/monitor.ts`
- `packages/layout-maxing/src/niching.ts`

## verify approach
- assert distinct ids across 7 elite slots after one gen step
- bench runGenetic pre/post P1 sort cache (popSize≥200, gens≥100)
- stagnation scenario: mutation magnitude observed to grow, not just rate
- crossover-only run: confirm offspring mutated after G4 fix
