Worker fitness sends full layouts, full lines, and cfg for every eval in optimizer.worker.ts (line 93) and worker.ts (line 3). For large graphs, structured clone overhead may rival the scoring cost.
Crossover has hidden O(N^2) work: matchEntity() does linear .find() for each entity in mutation.ts (line 146), used by crossover at mutation.ts (line 155). Build parent entity maps once.
Default tournamentSize is 1, and selection samples cfg.tournamentSize * population.length at genetic.ts (line 183). That makes tournament selection effectively “pick the best of the whole population” every time, reducing parent diversity.
repairOffspring defaults true at meta.ts (line 63), and fixOverlaps() does repeated pairwise entity scans in layout.ts (line 359). Good for validity, expensive for large graphs.
Current-Structure Optimizations
Precompute line geometry in fitness() once per layout eval.
Add spatial indexing: uniform grid is probably enough. Use it for line-box candidates, box-box min distance, and maybe broad-phase line-line intersection.
Move worker protocol to “init static graph once, then send positions only.” Use typed arrays; ideally transfer buffers.
Cache entity lookup maps for crossover/mutation instead of repeated .find().
Lower large-graph defaults: repairOffspring=false, shrinkRows=false, passes=1, smaller stop, tournamentSize≈0.1-0.3, cluster enabled automatically above a node threshold.
Make clustered fitness use a boundary halo, not cumulative resolved + current visibility forever at genetic.ts (line 872).
Longer term inside current TS: incremental fitness. Most mutations move a small set of boxes, so recompute only affected lines/boxes and their cached pair contributions.
Redesign Option
A proper large-graph redesign would separate static graph data from mutable genome:
static graph: nodes, ports, edges, groups, adjacency in typed arrays
genome: Float32Array or Int32Array grid positions
fitness kernel: Rust/Zig/C++ compiled to WASM, with spatial index and incremental dirty-region scoring
orchestration: JS runs GA/islands/workers/UI, WASM scores batches
worker model: one static graph per worker, batch many genomes, return scores
WASM alone will not save the current O(E^2 + E*N + N^2) shape. The biggest win is changing the data model and broad-phase/incremental scoring; WASM then compounds that win.
I’d prioritize: fitness() geometry precompute, worker protocol cleanup, then spatial index. After that, decide whether WASM is worth it based on measured time still left in the scoring kernel.
