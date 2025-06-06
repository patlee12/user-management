#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# ────────────────────────────────────────────────────────
# Paths and configuration
# ────────────────────────────────────────────────────────
ENV_FILE="$ROOT_DIR/docker/production/.env.production"
LIVE_CERT_DIR="$ROOT_DIR/docker/production/nginx/certs/live"
NGINX_CONF_OUTPUT="$ROOT_DIR/docker/production/nginx/nginx.production.conf"
CERTBOT_SCRIPT="$SCRIPT_DIR/request-certbot-cert.sh"
NGINX_SERVICE_NAME="nginx"
COMPOSE_FILE="$ROOT_DIR/docker/production/compose.production.yml"

# ────────────────────────────────────────────────────────
# Step 0: Cleanup
# ────────────────────────────────────────────────────────
echo "🧼 [0/14] Cleaning up any previously stopped or named containers..."
CONFLICT_NAMES=("postgres" "nginx" "cert-renewer" "homepage-app" "nestjs" "adminer")
for name in "${CONFLICT_NAMES[@]}"; do
  if docker ps -a --format '{{.Names}}' | grep -q "^$name$"; then
    echo "⚠️  Removing conflicting container: $name"
    docker rm -f "$name" 2>/dev/null || true
  fi
done

echo "🧹 Removing exited containers..."
docker container prune -f

echo "🧹 Removing dangling images..."
docker image prune -f

echo "🧹 Removing unused networks..."
docker network prune -f

# ────────────────────────────────────────────────────────
# Step 1: Setup permissions
# ────────────────────────────────────────────────────────
echo ""
echo "🔧 [1/14] Running setup.sh to ensure permissions…"
bash "$SCRIPT_DIR/setup.sh"

# ────────────────────────────────────────────────────────
# Step 2–6: Env, config, fallback certs
# ────────────────────────────────────────────────────────
echo ""
echo "🔄 [2–6] Running generate-production.sh to set up env and fallback certs…"
"$SCRIPT_DIR/generate-production.sh"

# ────────────────────────────────────────────────────────
# Step 7: Load env
# ────────────────────────────────────────────────────────
echo ""
echo "📦 [7/14] Sourcing environment variables from .env.production..."
if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "❌ Missing $ENV_FILE"
  exit 1
fi

# ────────────────────────────────────────────────────────
# Step 8: Build backend services
# ────────────────────────────────────────────────────────
echo ""
echo "📦 [8/14] Building backend services (nestjs, homepage-app)…"
docker compose -f "$COMPOSE_FILE" build nestjs homepage-app

# ────────────────────────────────────────────────────────
# Step 9: Boot nginx
# ────────────────────────────────────────────────────────
echo ""
echo "🚀 [9/14] Starting nginx container for initial TLS routing..."
docker compose -f "$COMPOSE_FILE" up -d "$NGINX_SERVICE_NAME"

# ────────────────────────────────────────────────────────
# Step 10: Wait for nginx HTTP if LE certs
# ────────────────────────────────────────────────────────
if [[ "${USE_MANUAL_CERTS:-false}" != "true" ]]; then
  echo "🌐 [10/14] Waiting for Nginx to respond on http://$DOMAIN_HOST…"
  for i in {1..30}; do
    if curl -s --head "http://$DOMAIN_HOST" | grep -q "HTTP/1.1 301"; then
      echo "✅ Nginx is reachable (HTTP 301)"
      break
    fi
    sleep 2
  done
else
  echo "⏩ [10/14] Skipping HTTP check — manual cert mode enabled."
fi

# ────────────────────────────────────────────────────────
# Step 11: Request cert
# ────────────────────────────────────────────────────────
echo ""
if [[ "${USE_MANUAL_CERTS:-false}" == "true" ]]; then
  echo "📦 [11/14] Manual certificate override enabled — skipping Certbot request."
else
  echo "🔐 [11/14] Attempting Let's Encrypt certificate request…"
  if ! bash "$CERTBOT_SCRIPT"; then
    echo "❌ Certbot failed (possibly due to rate limits or other errors), falling back to self-signed certificates."
  fi
fi

# ────────────────────────────────────────────────────────
# Step 12: Rebuild config and reload nginx
# ────────────────────────────────────────────────────────
echo ""
echo "🧱 [12/14] Rebuilding Nginx config with correct cert paths…"
CERT_DIR_PATH="$LIVE_CERT_DIR/$DOMAIN_HOST"
LE_CERT="$CERT_DIR_PATH/fullchain.pem"
LE_KEY="$CERT_DIR_PATH/privkey.pem"

if [[ "${USE_MANUAL_CERTS:-false}" == "true" && -f "$LE_CERT" && -f "$LE_KEY" ]]; then
  echo "✅ Using manually provided certs from: $CERT_DIR_PATH"
  export CERT_PATH="${LE_CERT//$ROOT_DIR\/docker\/production\/nginx\/certs/\/etc\/nginx\/certs}"
  export KEY_PATH="${LE_KEY//$ROOT_DIR\/docker\/production\/nginx\/certs/\/etc\/nginx\/certs}"
elif [[ -f "$LE_CERT" && -f "$LE_KEY" ]] && openssl x509 -in "$LE_CERT" -noout -issuer 2>/dev/null | grep -qi "Let's Encrypt"; then
  echo "✅ Let's Encrypt certificate detected — using it."
  export CERT_PATH="${LE_CERT//$ROOT_DIR\/docker\/production\/nginx\/certs/\/etc\/nginx\/certs}"
  export KEY_PATH="${LE_KEY//$ROOT_DIR\/docker\/production\/nginx\/certs/\/etc\/nginx\/certs}"
else
  echo "⚠️  No valid cert found — falling back to self-signed certs."
  export CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
  export KEY_PATH="/etc/nginx/certs/self-signed/server.key"
fi

"$SCRIPT_DIR/build-nginx-config.sh"
cp "$NGINX_CONF_OUTPUT" "$ROOT_DIR/docker/production/nginx/logs/nginx.production.conf-$(date +%Y%m%d-%H%M%S)"

echo "♻️ Reloading nginx with updated config…"
docker compose -f "$COMPOSE_FILE" exec "$NGINX_SERVICE_NAME" nginx -s reload || {
  echo "⚠️  Failed to reload nginx. Restarting container..."
  docker compose -f "$COMPOSE_FILE" restart "$NGINX_SERVICE_NAME"
}

# ────────────────────────────────────────────────────────
# Step 13–14: Launch stack
# ────────────────────────────────────────────────────────
echo ""
echo "🔄 [13/14] Building and launching all containers…"

if [[ "${USE_MANUAL_CERTS:-false}" == "true" ]]; then
  echo "❌ USE_MANUAL_CERTS=true detected — cert-renewer will be disabled."
  docker compose -f "$COMPOSE_FILE" up --build --force-recreate --remove-orphans --scale cert-renewer=0
else
  docker compose -f "$COMPOSE_FILE" up --build --force-recreate
fi

echo ""
echo "✅ [14/14] Production deployment complete."
