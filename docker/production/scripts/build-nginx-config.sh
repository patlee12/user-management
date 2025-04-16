#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

ENV_FILE="$ROOT_DIR/docker/production/.env.production"
ACME_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.acme.conf.template"
LETSENCRYPT_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.letsencrypt.conf.template"
SELFSIGNED_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.selfsigned.conf.template"
OUTPUT_CONF="$ROOT_DIR/docker/production/nginx/nginx.production.conf"

[[ -f "$ENV_FILE" ]] || { echo "❌ Missing $ENV_FILE"; exit 1; }

DOMAIN_HOST=$(grep '^DOMAIN_HOST=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | xargs)
GLOBAL_PREFIX=$(grep '^GLOBAL_PREFIX=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | xargs || echo "")
USE_MANUAL_CERTS=$(grep '^USE_MANUAL_CERTS=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | xargs || echo "false")

# Fallback if blank
GLOBAL_PREFIX="${GLOBAL_PREFIX:-}"

export DOMAIN_HOST
export GLOBAL_PREFIX

CERT_DIR="$ROOT_DIR/docker/production/nginx/certs/live/$DOMAIN_HOST"
FULLCHAIN="$CERT_DIR/fullchain.pem"
KEYFILE="$CERT_DIR/privkey.key"

if [[ "${ACME_MODE:-}" == "1" ]]; then
  TEMPLATE="$ACME_TEMPLATE"
  export SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
  export SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
  echo "📡 ACME_MODE=1 detected — generating ACME-only config."

elif [[ "$USE_MANUAL_CERTS" == "true" && -f "$FULLCHAIN" && -f "$KEYFILE" ]]; then
  export SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
  export SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.key"
  TEMPLATE="$LETSENCRYPT_TEMPLATE"
  echo "✅ Using manually provided certs from: $CERT_DIR"

elif [[ -f "$FULLCHAIN" && -f "$KEYFILE" ]] && openssl x509 -in "$FULLCHAIN" -noout -issuer 2>/dev/null | grep -qi "Let's Encrypt"; then
  export SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
  export SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.key"
  TEMPLATE="$LETSENCRYPT_TEMPLATE"
  echo "✅ Let's Encrypt certs found — generating full HTTPS config."

else
  export SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
  export SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
  TEMPLATE="$SELFSIGNED_TEMPLATE"
  echo "⚠️  Using self-signed fallback certs."
fi

echo "🔒 Using cert: $SSL_CERT_PATH"
echo "🔑 Using key:  $SSL_KEY_PATH"

# Safely run envsubst with blank fallback
envsubst '${DOMAIN_HOST} ${SSL_CERT_PATH} ${SSL_KEY_PATH} ${GLOBAL_PREFIX}' < "$TEMPLATE" > "$OUTPUT_CONF"
echo "✅ Generated: $OUTPUT_CONF"
