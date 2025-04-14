#!/usr/bin/env bash
set -euo pipefail

# ────────────────────────────────────────────────────────────
#  Paths & Variables
# ────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/production/.env.production"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing $ENV_FILE"
  exit 1
fi

# Clean and validate domain
DOMAIN=$(grep '^DOMAIN_HOST=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | xargs)
if [[ -z "$DOMAIN" ]]; then
  echo "❌ DOMAIN_HOST is not set properly in .env.production"
  exit 1
fi

TEST_DOMAIN="${DOMAIN}"

MAX_RETRIES=30
SLEEP_INTERVAL=2

# ────────────────────────────────────────────────────────────
#  Wait for Nginx
# ────────────────────────────────────────────────────────────
echo "🕒 Waiting for Nginx to become reachable on http://$TEST_DOMAIN …"
sleep 2  # small delay before first attempt

for ((i=1; i<=MAX_RETRIES; i++)); do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $TEST_DOMAIN" http://127.0.0.1 || true)
  if [[ "$STATUS_CODE" == "200" || "$STATUS_CODE" == "301" || "$STATUS_CODE" == "302" ]]; then
    echo "✅ Nginx is reachable! (HTTP $STATUS_CODE)"
    exit 0
  fi
  echo "⌛ Attempt $i/$MAX_RETRIES failed (HTTP $STATUS_CODE)… retrying in $SLEEP_INTERVAL seconds."
  sleep $SLEEP_INTERVAL
done

echo "❌ Nginx did not become reachable in time after $((MAX_RETRIES * SLEEP_INTERVAL)) seconds."
exit 1
