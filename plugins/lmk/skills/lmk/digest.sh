#!/usr/bin/env bash
# Prints a compact digest of the most recent Claude Code sessions for a project dir.
# Usage: digest.sh [project_dir] [num_sessions]
dir="${1:-$PWD}"; n="${2:-3}"
slug=$(printf '%s' "$dir" | sed 's/[^A-Za-z0-9]/-/g')
pdir="$HOME/.claude/projects/$slug"
[ -d "$pdir" ] || { echo "No past sessions found for $dir"; exit 0; }
cd "$pdir" || exit 0
for f in $(ls -t *.jsonl 2>/dev/null | head -n "$n"); do
  echo "=== Session $(basename "$f" .jsonl) — last active $(date -r "$f" '+%Y-%m-%d %H:%M') ==="
  jq -r '
    if .type=="user" and (.message.content|type)=="string" and (.isMeta|not) then
      "USER: " + (.message.content|.[0:400])
    elif .type=="assistant" then
      (.message.content[]? | select(.type=="text") | "CLAUDE: " + (.text|.[0:600]))
    else empty end' "$f" 2>/dev/null | grep -v '^USER: <' | tail -n 40
  echo
done
