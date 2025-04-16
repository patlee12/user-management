#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$ROOT_DIR/docker/production/scripts/env-logs"

SHARED_ENV="$ROOT_DIR/docker/production/.env.production"
BACKEND_ENV="$ROOT_DIR/apps/backend/.env"
FRONTEND_ENV="$ROOT_DIR/apps/frontend/homepage-app/.env"

# Ensure env log directory exists
mkdir -p "$LOG_DIR"

echo "📦 Available environment logs:"
echo ""

mapfile -t snapshots < <(find "$LOG_DIR" -type f -name ".env.log-*" | sort)

if [ ${#snapshots[@]} -eq 0 ]; then
  echo "❌ No environment snapshot logs found in $LOG_DIR"
  exit 1
fi

for i in "${!snapshots[@]}"; do
  echo "  [$((i+1))] $(basename "${snapshots[$i]}")"
done

echo ""
read -rp "#? Select a snapshot to restore [1-${#snapshots[@]}]: " selection
echo ""

if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#snapshots[@]} ]; then
  echo "❌ Invalid selection."
  exit 1
fi

log_file="${snapshots[$((selection-1))]}"
echo "✅ Selected: $(basename "$log_file")"

extract_section() {
  local header="$1"
  awk -v h="$header" '
    $0 == h {found=1; next}
    /^[[:print:]]/ && /^[^#]/ && /^[^[:space:]]+ *=/ && found { print }
    /^[[:space:]]*$/ && found { exit }
  ' "$log_file"
}

shared_section=$(extract_section "🔧 SHARED (.env.production)")
backend_section=$(extract_section "📂 BACKEND (.env)")
frontend_section=$(extract_section "🖥️  FRONTEND (.env)")

# Write to files if content found
if [[ -n "$shared_section" ]]; then
  echo "$shared_section" > "$SHARED_ENV"
  echo "✅ Restored: $SHARED_ENV"
else
  echo "⚠️  Section '🔧 SHARED (.env.production)' was empty or missing in log."
fi

if [[ -n "$backend_section" ]]; then
  echo "$backend_section" > "$BACKEND_ENV"
  echo "✅ Restored: $BACKEND_ENV"
else
  echo "⚠️  Section '📂 BACKEND (.env)' was empty or missing in log."
fi

if [[ -n "$frontend_section" ]]; then
  echo "$frontend_section" > "$FRONTEND_ENV"
  echo "✅ Restored: $FRONTEND_ENV"
else
  echo "⚠️  Section '🖥️  FRONTEND (.env)' was empty or missing in log."
fi

echo ""
echo "🎉 Environment restored from snapshot: $(basename "$log_file")"
