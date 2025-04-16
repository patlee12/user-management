#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
NGINX_CONTAINER="nginx"

if [ -z "$DOMAIN" ]; then
  echo "❌ DOMAIN not provided"
  exit 1
fi

echo "📡 Attempting Let's Encrypt cert for $DOMAIN..."

docker compose -f ./docker/production/docker-compose-production.yml run --rm certbot \
  certonly --webroot -w /var/www/html \
  --email admin@$DOMAIN --agree-tos --no-eff-email \
  -d "$DOMAIN"

CERT_DIR="./docker/production/nginx/certs/live/$DOMAIN"

if [[ -f "$CERT_DIR/fullchain.pem" && -f "$CERT_DIR/privkey.pem" ]]; then
  echo "✅ Certs successfully obtained. Reloading Nginx..."
  docker compose -f ./docker/production/docker-compose-production.yml exec $NGINX_CONTAINER nginx -s reload
else
  echo "⚠️ Certbot failed or certs not found. Keeping self-signed fallback."
fi
