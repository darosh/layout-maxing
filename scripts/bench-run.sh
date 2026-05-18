#!/bin/bash

REPO=/Users/jan/Documents/GitHub/layout-maxing
CLI_DIR="$REPO/packages/layout-maxing-cli"
FIXTURES="$CLI_DIR/tests/fixtures"
RUNS_DIR="$REPO/temp/runs"

mkdir -p "$RUNS_DIR"

LAST=$(ls "$RUNS_DIR" 2>/dev/null | grep -E '^[0-9]+$' | sort -n | tail -1)
RUN_NUM=$(( ${LAST:-0} + 1 ))
RUN_DIR="$RUNS_DIR/$RUN_NUM"
mkdir -p "$RUN_DIR"

GIT=$(git -C "$REPO" rev-parse --short HEAD)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo ""
echo "=== Bench run $RUN_NUM | git: $GIT | $TIMESTAMP ==="
echo ""

NAMES=("example-1" "example-2" "example-3" "example-4" "example-5")
FILES=(
  "$FIXTURES/test.json"
  "$FIXTURES/the-synth.json"
  "$FIXTURES/reverb-example.json"
  "$FIXTURES/reverb-grouped-example.json"
  "$FIXTURES/the-voice.rnbopat"
)
FLAGS=("" "" "" "" "--preset Clustered")

for i in "${!NAMES[@]}"; do
  NAME="${NAMES[$i]}"
  FILE="${FILES[$i]}"
  EXTRA="${FLAGS[$i]}"
  OUT_DIR="$RUN_DIR/$NAME"
  mkdir -p "$OUT_DIR"
  OUT_FILE="$OUT_DIR/out.json"

  N=$(( i + 1 ))
  LAYOUT_CMD="deno run --allow-all --sloppy-imports $CLI_DIR/src/index.ts layout $FILE $OUT_FILE --passes 1 $EXTRA"
  echo "[$N/5] START $NAME  $(basename "$FILE")  $EXTRA"
  echo "  cmd: $LAYOUT_CMD"

  START_MS=$(python3 -c "import time; print(int(time.time()*1000))")

  $LAYOUT_CMD > "$OUT_DIR/stdout.log" 2>&1 || true

  ELAPSED_MS=$(( $(python3 -c "import time; print(int(time.time()*1000))") - START_MS ))
  ELAPSED_S=$(python3 -c "print(round($ELAPSED_MS/1000, 2))")

  # Score the optimized output
  FITNESS_CMD="deno run --allow-all --sloppy-imports $CLI_DIR/src/index.ts fitness $OUT_FILE"
  SCORE="null"
  if [[ -f "$OUT_FILE" ]]; then
    echo "  fitness cmd: $FITNESS_CMD"
    SCORE=$($FITNESS_CMD \
      > "$OUT_DIR/fitness.json" 2>/dev/null && \
      python3 -c "
import json, sys
txt = open('$OUT_DIR/fitness.json').read().strip()
# fitness output: first line is header, rest is JSON
obj = json.loads(txt[txt.index('{'):])
print(int(obj['score']))
" 2>/dev/null || echo "null")
  fi

  echo "[$N/5] DONE  $NAME  time=${ELAPSED_S}s  score=$SCORE"
  echo ""

  python3 -c "
import json
score = None if '$SCORE' == 'null' else int('$SCORE')
r = {'name': '$NAME', 'file': '$(basename "$FILE")', 'time_s': $ELAPSED_S, 'score': score}
open('$OUT_DIR/result.json', 'w').write(json.dumps(r, indent=2))
"
done

# Assemble meta.json
python3 - <<PYEOF
import json, os
run_dir = '$RUN_DIR'
examples = []
for name in ['example-1','example-2','example-3','example-4','example-5']:
    p = os.path.join(run_dir, name, 'result.json')
    if os.path.exists(p):
        examples.append(json.load(open(p)))
meta = {'run': $RUN_NUM, 'git': '$GIT', 'timestamp': '$TIMESTAMP', 'examples': examples}
open(os.path.join(run_dir, 'meta.json'), 'w').write(json.dumps(meta, indent=2))
print(json.dumps(meta, indent=2))
PYEOF

echo "=== Run $RUN_NUM complete. Results in $RUN_DIR ==="
echo "Compare: bash $REPO/scripts/bench-compare.sh"
