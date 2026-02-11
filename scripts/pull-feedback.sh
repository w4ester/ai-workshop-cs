#!/usr/bin/env bash
# pull-feedback.sh — Pull pending feedback from CF Worker KV into BEADS
#
# Usage:  ./scripts/pull-feedback.sh [--dry-run]
#
# Requires:
#   - ~/.config/ai-workshop-cs/feedback.key (passphrase file)
#   - bd CLI in PATH
#   - curl and jq

set -euo pipefail

WORKER_BASE="https://ai-workshop-groq-proxy.howdy-1bc.workers.dev"
KEY_FILE="$HOME/.config/ai-workshop-cs/feedback.key"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BEADS_DIR="$REPO_ROOT/.beads"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[dry-run] No changes will be written."
fi

# --- Preflight checks ---
for cmd in curl jq bd; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is required but not found in PATH." >&2
    exit 1
  fi
done

if [[ ! -f "$KEY_FILE" ]]; then
  echo "Error: Passphrase file not found at $KEY_FILE" >&2
  echo "Create it with:  mkdir -p ~/.config/ai-workshop-cs && echo 'YOUR_PASSPHRASE' > $KEY_FILE && chmod 600 $KEY_FILE" >&2
  exit 1
fi

PASSPHRASE="$(cat "$KEY_FILE" | tr -d '[:space:]')"

# --- Pull pending feedback ---
echo "Pulling pending feedback from worker..."
RESPONSE=$(curl -sf "${WORKER_BASE}/feedback/pull?passphrase=${PASSPHRASE}" 2>&1) || {
  echo "Error: Failed to reach worker. Response: $RESPONSE" >&2
  exit 1
}

COUNT=$(echo "$RESPONSE" | jq -r '.count')
if [[ "$COUNT" == "0" || "$COUNT" == "null" ]]; then
  echo "No pending feedback items."
  exit 0
fi

echo "Found $COUNT pending feedback item(s)."

# --- Process each item ---
KEYS_TO_ACK='[]'

echo "$RESPONSE" | jq -c '.items[]' | while IFS= read -r item; do
  KEY=$(echo "$item" | jq -r '.key')
  ISSUE=$(echo "$item" | jq -c '.issue')

  ID=$(echo "$ISSUE" | jq -r '.id')
  TITLE=$(echo "$ISSUE" | jq -r '.title')
  DESC=$(echo "$ISSUE" | jq -r '.description')
  STATUS=$(echo "$ISSUE" | jq -r '.status')
  PRIORITY=$(echo "$ISSUE" | jq -r '.priority')
  ISSUE_TYPE=$(echo "$ISSUE" | jq -r '.issue_type')
  CREATED=$(echo "$ISSUE" | jq -r '.created_at')
  TAGS=$(echo "$ISSUE" | jq -r '.tags | join(", ")')
  PAGE_URL=$(echo "$ISSUE" | jq -r '.source.page_url')
  PII=$(echo "$ISSUE" | jq -r '.source.pii_redacted | join(", ")')

  echo "  Processing: $ID — $TITLE"

  # Write .md file with YAML frontmatter
  if [[ "$DRY_RUN" == "false" ]]; then
    cat > "${BEADS_DIR}/${ID}.md" <<MDEOF
---
id: ${ID}
title: "${TITLE}"
status: ${STATUS}
priority: ${PRIORITY}
issue_type: ${ISSUE_TYPE}
created_at: ${CREATED}
tags: [${TAGS}]
source_page: ${PAGE_URL}
---

## User Message

${DESC}

## Triage Checklist

- [ ] Categorize: actionable bug / feature request / question / praise
- [ ] Assess priority (P0-P3)
- [ ] Link to existing issue if duplicate
- [ ] Create implementation issue if actionable

---
*Auto-imported from dogfood feedback. BEADS ID: ${ID}. w4ester & ai orchestration.*
MDEOF
    echo "    Wrote ${BEADS_DIR}/${ID}.md"
  fi

  # Create BEADS issue (bd assigns its own ID with the correct prefix)
  if [[ "$DRY_RUN" == "false" ]]; then
    TAGS_CSV=$(echo "$ISSUE" | jq -r '.tags | join(",")')
    cd "$REPO_ROOT"
    BD_ID=$(bd create "$TITLE" \
      -d "$DESC" \
      -p "$PRIORITY" \
      --external-ref "$ID" \
      2>&1) || echo "    Warning: bd create failed for $ID"
    echo "    Created BEADS issue: $BD_ID"
  else
    echo "  [dry-run] Would create BEADS issue for $ID"
  fi
done

# --- Acknowledge pulled items ---
KEYS_JSON=$(echo "$RESPONSE" | jq -c '[.items[].key]')
if [[ "$DRY_RUN" == "true" ]]; then
  echo "[dry-run] Would acknowledge keys: $KEYS_JSON"
else
  echo "Acknowledging $COUNT item(s)..."
  ACK_RESPONSE=$(curl -sf -X POST "${WORKER_BASE}/feedback/ack" \
    -H "Content-Type: application/json" \
    -d "{\"passphrase\":\"${PASSPHRASE}\",\"keys\":${KEYS_JSON}}" 2>&1) || {
    echo "Warning: Ack request failed. Items will remain pending for next pull." >&2
    echo "Response: $ACK_RESPONSE" >&2
  }
  ACKED=$(echo "$ACK_RESPONSE" | jq -r '.acked_count // 0')
  echo "Acknowledged $ACKED item(s)."
fi

echo "Done."
