#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/production/.env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Missing environment file: $ENV_FILE"
  exit 1
fi

DOMAIN=$(grep '^DOMAIN_HOST=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"\r\n')
LIVE_DIR="$ROOT_DIR/docker/production/nginx/certs/live/$DOMAIN"
FALLBACK_DIR="$ROOT_DIR/docker/production/nginx/certs/self-signed"

# 🛑 Prevent overwriting live Let's Encrypt certs
if [[ -f "$LIVE_DIR/fullchain.pem" || -f "$LIVE_DIR/privkey.pem" ]]; then
  echo "❌ Live certificate already exists for $DOMAIN. Not generating fallback cert to avoid conflict."
  echo "   Remove $LIVE_DIR if you want to recreate fallback certs."
  exit 0
fi

echo "🔐 Generating self-signed SSL certificates for: $DOMAIN"
mkdir -p "$FALLBACK_DIR"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$FALLBACK_DIR/server.key" \
  -out "$FALLBACK_DIR/server.crt" \
  -subj "/CN=$DOMAIN"

echo "✅ Self-signed certs generated:"
echo "   ├── $FALLBACK_DIR/server.crt (fallback)"
echo "   └── $FALLBACK_DIR/server.key (fallback)"
