#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/production/docker-compose-production.yml"
ENV_FILE="$ROOT_DIR/docker/production/.env.production"
ENV_LOG_LOADER="$SCRIPT_DIR/load-env-from-log.sh"

SKIP_ENV_GENERATION=false
NEEDS_VOLUME_RESET=false
FORCE_RESET="${1:-}"

# Step 1: Confirm volume reset
if [[ "$FORCE_RESET" == "--reset" ]]; then
  NEEDS_VOLUME_RESET=true
else
  echo ""
  echo "🗃️  [1/6] Reset Postgres volume? This **deletes** all data."
  read -rp "⚠️   Type 'reset' to proceed or press Enter to skip: " RESET_CONFIRM
  if [[ "$RESET_CONFIRM" == "reset" ]]; then
    NEEDS_VOLUME_RESET=true
  fi
fi

# Step 2: Restore or generate environment
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

# Step 3: Source ENV variables
set -a
source "$ENV_FILE"
set +a

# Step 4: Reset Postgres volume if requested
if [[ "$NEEDS_VOLUME_RESET" == "true" ]]; then
  if [[ -z "${POSTGRES_VOLUME_NAME:-}" ]]; then
    echo "❌ POSTGRES_VOLUME_NAME is not set. Aborting volume reset."
    exit 1
  fi

  echo "🔎 Checking if volume '$POSTGRES_VOLUME_NAME' exists..."
  if docker volume inspect "$POSTGRES_VOLUME_NAME" >/dev/null 2>&1; then
    echo "🛑 Stopping all containers using the volume..."
    docker rm -f postgres 2>/dev/null || true
    docker container prune -f

    echo "🧨 Removing Docker volume: $POSTGRES_VOLUME_NAME..."
    docker compose -f "$COMPOSE_FILE" down -v || true

    if docker volume inspect "$POSTGRES_VOLUME_NAME" >/dev/null 2>&1; then
      docker volume rm "$POSTGRES_VOLUME_NAME" || {
        echo "⚠️ Could not delete volume — still in use?"
        docker ps -a --filter volume="$POSTGRES_VOLUME_NAME"
        exit 1
      }
    else
      echo "ℹ️ Volume already removed."
    fi
  else
    echo "ℹ️ Volume '$POSTGRES_VOLUME_NAME' does not exist. Skipping removal."
  fi
fi

# Step 5–6: Setup
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
