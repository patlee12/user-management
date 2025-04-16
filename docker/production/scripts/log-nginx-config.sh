#!/usr/bin/env bash
set -euo pipefail

# ────────────────────────────────────────────────────────
# Resolve paths
# ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_DIR="$ROOT_DIR/docker/production/nginx/logs"
COMPOSE_FILE="$ROOT_DIR/docker/production/docker-compose-production.yml"
NGINX_CONTAINER="nginx"

# ────────────────────────────────────────────────────────
# Timestamped backup filename
# ────────────────────────────────────────────────────────
timestamp=$(date "+%Y%m%d-%H%M%S")
backup_file="$LOG_DIR/nginx.production.conf-$timestamp"

# ────────────────────────────────────────────────────────
# Ensure logs directory exists
# ────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"

# ────────────────────────────────────────────────────────
# Copy nginx.conf from running container
# ────────────────────────────────────────────────────────
if docker compose -f "$COMPOSE_FILE" ps -q "$NGINX_CONTAINER" >/dev/null; then
  docker compose -f "$COMPOSE_FILE" exec -T "$NGINX_CONTAINER" cat /etc/nginx/nginx.conf > "$backup_file"
  echo "📁 Backed up nginx.conf to $backup_file"
else
  echo "❌ Nginx container not running. Cannot log config."
fi
