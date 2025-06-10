#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "🧹 Stopping and removing dev containers..."

DEV_COMPOSE_FILE="./docker/compose.development.yml"

# Step 1: Standard compose down
if [ -f "$DEV_COMPOSE_FILE" ]; then
  docker compose -f "$DEV_COMPOSE_FILE" down || true
  echo "✅ Dev containers stopped from compose file."
else
  echo "❌ Dev Docker Compose file not found at: $DEV_COMPOSE_FILE"
fi

# Step 2: Force remove known containers by name
CONTAINERS_TO_CLEAN=(postgres adminer redis nestjs homepage-app service-watcher nginx cert-renewer)

for NAME in "${CONTAINERS_TO_CLEAN[@]}"; do
  CONTAINER_ID=$(docker ps -aqf "name=^/${NAME}$" || true)
  if [ -n "$CONTAINER_ID" ]; then
    echo "⚠️ Found orphaned container '$NAME'. Removing..."
    docker rm -f "$CONTAINER_ID"
    echo "✅ Container '$NAME' removed."
  fi
done
