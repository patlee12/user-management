#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/production/docker-compose-production.yml"
ENV_LOG_LOADER="$SCRIPT_DIR/load-env-from-log.sh"

SKIP_ENV_GENERATION=false

echo ""
echo "🗃️  [1/6] Reset Postgres volume? This **deletes** all data."
read -rp "⚠️   Type 'reset' to proceed or press Enter to skip: " RESET_CONFIRM
if [[ "$RESET_CONFIRM" == "reset" ]]; then
  echo "🛑 Stopping containers and removing Postgres volume..."
  docker compose -f "$COMPOSE_FILE" down -v || true
  docker volume rm user-management_postgres 2>/dev/null || true

  echo ""
  echo "🔄 [2/6] Generating .env files due to reset..."
  "$SCRIPT_DIR/generate-env-production.sh"
else
  echo ""
  echo "📁 Would you like to load a previously saved environment snapshot?"
  read -rp "📦 Type 'yes' to restore from snapshot, or press Enter to generate a new one: " RESTORE_CONFIRM

  if [[ "$RESTORE_CONFIRM" =~ ^[yY][eE][sS]$ ]]; then
    echo ""
    echo "📦 [2/6] Loading .env from snapshot log..."
    bash "$ENV_LOG_LOADER"
    SKIP_ENV_GENERATION=true
  else
    echo ""
    echo "🔄 [2/6] Generating new .env files..."
    "$SCRIPT_DIR/generate-env-production.sh"
  fi
fi

echo ""
echo "🧱 [3/6] Building nginx.production.conf from template..."
"$SCRIPT_DIR/build-nginx-config.sh"

echo ""
echo "📁 [4/6] Creating Certbot webroot structure..."
"$SCRIPT_DIR/prepare-webroot.sh"

echo ""
echo "🔐 [5/6] Generating fallback self-signed certificate (if no live cert exists)..."
"$SCRIPT_DIR/generate-certs.sh"

echo ""
echo "✅ [1–6] Environment setup complete."
