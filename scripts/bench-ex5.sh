#!/bin/bash
# Single-example bench for reverb-example.json (app example 5)
# Usage: LABEL=name [CFG_FILE=path] [SEEDS="1 2 5"] bash scripts/bench-ex5.sh

REPO=/Users/jan/Documents/GitHub/layout-maxing
CLI_DIR="$REPO/packages/layout-maxing-cli"
FIXTURE="$CLI_DIR/tests/fixtures/reverb-example.json"
RUNS_DIR="$REPO/temp/runs-ex5"

mkdir -p "$RUNS_DIR"

LAST=$(ls "$RUNS_DIR" 2>/dev/null | grep -E '^[0-9]+$' | sort -n | tail -1)
RUN_NUM=$(( ${LAST:-0} + 1 ))
RUN_DIR="$RUNS_DIR/$RUN_NUM"
mkdir -p "$RUN_DIR"

LABEL="${LABEL:-unlabeled}"
SEEDS="${SEEDS:-1 2 5}"

if [[ -n "$CFG_FILE" ]]; then
  cp "$CFG_FILE" "$RUN_DIR/config.json"
else
  echo '{}' > "$RUN_DIR/config.json"
fi

GIT=$(git -C "$REPO" rev-parse --short HEAD)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "=== bench-ex5 run $RUN_NUM | $LABEL | git: $GIT | $TIMESTAMP ==="
[[ -n "$CFG_FILE" ]] && echo "    cfg: $CFG_FILE"
echo "    seeds: $SEEDS"
echo ""

seed_arr=($SEEDS)
SCORES=()

for i in "${!seed_arr[@]}"; do
  S="${seed_arr[$i]}"
  OUT_DIR="$RUN_DIR/seed-$S"
  mkdir -p "$OUT_DIR"
  OUT_FILE="$OUT_DIR/out.json"

  N=$(( i + 1 ))
  TOTAL=${#seed_arr[@]}

  LAYOUT_CMD="deno run --allow-all --sloppy-imports $CLI_DIR/src/index.ts layout $FIXTURE $OUT_FILE ${CFG_FILE:+--cfg $CFG_FILE} --seed $S --deterministic true"
  echo "[$N/$TOTAL] seed=$S  START"
  echo "  cmd: $LAYOUT_CMD"

  START_MS=$(python3 -c "import time; print(int(time.time()*1000))")
  $LAYOUT_CMD > "$OUT_DIR/stdout.log" 2>&1 || true
  ELAPSED_MS=$(( $(python3 -c "import time; print(int(time.time()*1000))") - START_MS ))
  ELAPSED_S=$(python3 -c "print(round($ELAPSED_MS/1000, 2))")

  SCORE="null"
  if [[ -f "$OUT_FILE" ]]; then
    FITNESS_CMD="deno run --allow-all --sloppy-imports $CLI_DIR/src/index.ts fitness $OUT_FILE"
    SCORE=$($FITNESS_CMD > "$OUT_DIR/fitness.json" 2>/dev/null && \
      python3 -c "
import json, sys
txt = open('$OUT_DIR/fitness.json').read().strip()
obj = json.loads(txt[txt.index('{'):])
print(int(obj['score']))
" 2>/dev/null || echo "null")
  fi

  echo "[$N/$TOTAL] seed=$S  time=${ELAPSED_S}s  score=$SCORE"
  echo ""
  SCORES+=("$SCORE")

  python3 -c "
import json
score = None if '$SCORE' == 'null' else int('$SCORE')
r = {'seed': $S, 'time_s': $ELAPSED_S, 'score': score}
open('$OUT_DIR/result.json', 'w').write(json.dumps(r, indent=2))
"
done

python3 - <<PYEOF
import json, os
run_dir = '$RUN_DIR'
seeds_str = '$SEEDS'
seeds = [int(s) for s in seeds_str.split()]
results = []
for s in seeds:
    p = os.path.join(run_dir, f'seed-{s}', 'result.json')
    if os.path.exists(p):
        results.append(json.load(open(p)))
scores = [r['score'] for r in results if r.get('score') is not None]
mean = round(sum(scores)/len(scores)) if scores else None
meta = {
    'run': $RUN_NUM, 'label': '$LABEL', 'git': '$GIT', 'timestamp': '$TIMESTAMP',
    'seeds': seeds, 'results': results, 'scores': scores, 'mean': mean
}
open(os.path.join(run_dir, 'meta.json'), 'w').write(json.dumps(meta, indent=2))
scores_str = ', '.join(str(s) for s in scores)
print(f"\n=== Run $RUN_NUM [{' $LABEL'}] seeds=[{scores_str}] mean={mean} ===")
PYEOF

echo "=== Run $RUN_NUM complete. Results in $RUN_DIR ==="
