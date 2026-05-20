# layout-maxing-bench

Parameter-sweep benchmarking framework for `layout-maxing`.

Stores deterministic, resumable runs in a local SQLite database (`bench.db`).

## Quick start

```bash
# from this package directory
deno task run --phase baseline
deno task status
deno task show --port 8787

# or from repo root
deno task --cwd packages/layout-maxing-bench run --phase baseline
```

## Commands

```
bench run     [--phase baseline|preset|oat|synergy|gapfill|all]
              [--group stagnation|niching|cluster|mutweights|fitness]
              [--example example-1..5] [--limit N] [--seed N] [--db PATH]
bench status                       # phase progress, recent rows
bench show    [--port 8787]        # web viz with live updates
bench export  --run <id>           # print resolved config JSON for a run
bench export  --top --example example-2 --limit 10
bench summary --group stagnation [--example example-2]
```

## Constraints (by design)

- `popSize = 1` for all swept rows (presets keep their own popSize).
- `stop ≤ 1499` hard cap; `generations` left at default.
- Example 5 (`the-voice`) only runs with `cluster > 0` configs.
- Warns every 15 minutes for any in-flight run with id + elapsed.

## Data

- `bench.db` — SQLite, gitignored. Schema in `src/db.ts`.
- Each row stores resolved config JSON + per-param value index for fast filter aggregation.
- Determinism: master seed × group × sample_index → param draw seed + GA seed.

## Worker setup

Mirrors `packages/layout-maxing-cli/src/worker.ts`. One worker pool per run; reused across generations.
