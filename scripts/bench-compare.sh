#!/bin/bash
# Usage: bench-compare.sh [A] [B]
# Defaults to the last two run numbers.

REPO=/Users/jan/Documents/GitHub/layout-maxing
RUNS_DIR="$REPO/temp/runs"

# Determine run numbers to compare
ALL=$(ls "$RUNS_DIR" 2>/dev/null | grep -E '^[0-9]+$' | sort -n)
COUNT=$(echo "$ALL" | wc -l | tr -d ' ')

if [[ -n "$1" && -n "$2" ]]; then
  A="$1"; B="$2"
elif [[ -n "$1" ]]; then
  # Compare given run against previous
  PREV=$(echo "$ALL" | grep -B1 "^${1}$" | head -1)
  A="${PREV:-$1}"; B="$1"
elif [[ "$COUNT" -ge 2 ]]; then
  A=$(echo "$ALL" | tail -2 | head -1)
  B=$(echo "$ALL" | tail -1)
else
  echo "Need at least 2 runs. Usage: bench-compare.sh [A] [B]"
  exit 1
fi

META_A="$RUNS_DIR/$A/meta.json"
META_B="$RUNS_DIR/$B/meta.json"

if [[ ! -f "$META_A" ]]; then echo "Run $A not found at $META_A"; exit 1; fi
if [[ ! -f "$META_B" ]]; then echo "Run $B not found at $META_B"; exit 1; fi

GIT_A=$(python3 -c "import json,sys; d=json.load(open('$META_A')); print(d.get('git','?'))")
GIT_B=$(python3 -c "import json,sys; d=json.load(open('$META_B')); print(d.get('git','?'))")

echo ""
echo "=== Compare run $A ($GIT_A) vs run $B ($GIT_B) ==="
echo ""
printf "%-12s  %8s  %8s  %8s    %14s  %14s  %10s\n" \
  "Example" "Time-$A" "Time-$B" "ΔTime%" "Score-$A" "Score-$B" "ΔScore%"
printf "%-12s  %8s  %8s  %8s    %14s  %14s  %10s\n" \
  "------------" "--------" "--------" "--------" "--------------" "--------------" "----------"

python3 - "$META_A" "$META_B" <<'PYEOF'
import json, sys

def load(path):
    with open(path) as f:
        return json.load(f)

a = load(sys.argv[1])
b = load(sys.argv[2])

by_name_a = {e['name']: e for e in a['examples']}
by_name_b = {e['name']: e for e in b['examples']}

names = [e['name'] for e in a['examples']]

def pct(old, new):
    if old is None or new is None or old == 0:
        return 'N/A'
    v = (new - old) / old * 100
    sign = '+' if v > 0 else ''
    return f'{sign}{v:.1f}%'

def flag(score_old, score_new):
    if score_old is None or score_new is None:
        return ''
    return ' ⚠' if score_new > score_old * 1.005 else ''  # >0.5% worse

for name in names:
    ea = by_name_a.get(name, {})
    eb = by_name_b.get(name, {})
    ta = ea.get('time_s')
    tb = eb.get('time_s')
    sa = ea.get('score')
    sb = eb.get('score')

    dt = pct(ta, tb)
    ds = pct(sa, sb)
    warn = flag(sa, sb)

    print(f"{name:<12}  {str(ta or '?'):>8}s  {str(tb or '?'):>8}s  {dt:>8}    "
          f"{str(int(sa) if sa else '?'):>14}  {str(int(sb) if sb else '?'):>14}  {ds:>10}{warn}")

PYEOF

echo ""
echo "ΔTime%: negative = faster in run $B. ΔScore%: negative = better (lower score) in run $B. ⚠ = notably worse."
