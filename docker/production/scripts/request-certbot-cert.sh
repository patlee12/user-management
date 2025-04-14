#!/usr/bin/env bash
set -euo pipefail

# ────────────────────────────────────────────────────────
# Resolve paths
# ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/production/.env.production"

# ────────────────────────────────────────────────────────
# Load and sanitize environment variables
# ────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Environment file not found: $ENV_FILE"
  exit 1
fi

# Extract and sanitize DOMAIN_HOST and ADMIN_EMAIL using awk
DOMAIN_HOST=$(awk -F= '/^DOMAIN_HOST=/ { gsub(/["\r\n ]/, "", $2); print $2; exit }' "$ENV_FILE")
ADMIN_EMAIL=$(awk -F= '/^ADMIN_EMAIL=/ { gsub(/["\r\n ]/, "", $2); print $2; exit }' "$ENV_FILE")

if [[ -z "$DOMAIN_HOST" ]]; then
  echo "❌ DOMAIN_HOST is not set in $ENV_FILE"
  exit 1
fi

if [[ -z "$ADMIN_EMAIL" ]]; then
  echo "❌ ADMIN_EMAIL is not set in $ENV_FILE"
  exit 1
fi

# ────────────────────────────────────────────────────────
# Build domain list
# ────────────────────────────────────────────────────────
DOMAINS=(
  "$DOMAIN_HOST"
  "admin.$DOMAIN_HOST"
  "nestjs.$DOMAIN_HOST"
  "swagger.$DOMAIN_HOST"
)

echo "🔐 Requesting Let's Encrypt certificate for:"
for d in "${DOMAINS[@]}"; do
  echo " • $d"
done

# ────────────────────────────────────────────────────────
# Request certificate using Certbot in webroot mode
# ────────────────────────────────────────────────────────
echo "🔐 Requesting Let's Encrypt certificate for: $DOMAIN_HOST and subdomains"

if ! docker run --rm \
  -v "$ROOT_DIR/docker/production/nginx/certs:/etc/letsencrypt" \
  -v "$ROOT_DIR/docker/production/nginx/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$ADMIN_EMAIL" \
  --agree-tos \
  --non-interactive \
  --no-eff-email \
  $(printf -- "-d %s " "${DOMAINS[@]}") \
  --verbose; then
  echo "❌ Certbot failed (possibly due to rate limits or other errors), falling back to self-signed certificates."
  exit 2
fi

echo "✅ Certificate obtained for: $DOMAIN_HOST and subdomains"
