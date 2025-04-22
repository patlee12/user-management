#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

ENV_FILE="$ROOT_DIR/docker/production/.env.production"
ACME_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.acme.conf.template"
TLS_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.letsencrypt.conf.template"
SELF_TEMPLATE="$ROOT_DIR/docker/production/nginx/nginx.production.selfsigned.conf.template"
OUTPUT_CONF="$ROOT_DIR/docker/production/nginx/nginx.production.conf"

[[ -f "$ENV_FILE" ]] || { echo "❌ Missing $ENV_FILE"; exit 1; }

DOMAIN_HOST=$(grep '^DOMAIN_HOST=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')
GLOBAL_PREFIX=$(grep '^GLOBAL_PREFIX=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' || true)
USE_MANUAL_CERTS=$(grep '^USE_MANUAL_CERTS=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' || echo "false")
GLOBAL_PREFIX="${GLOBAL_PREFIX:-}"

LIVE_DIR="$ROOT_DIR/docker/production/nginx/certs/live/$DOMAIN_HOST"
FULLCHAIN="$LIVE_DIR/fullchain.pem"
PRIVKEY="$LIVE_DIR/privkey.pem"

# Use raw paths if readlink fails due to perms
RESOLVED_FULLCHAIN=$(readlink -f "$FULLCHAIN" 2>/dev/null || echo "$FULLCHAIN")
RESOLVED_PRIVKEY=$(readlink -f "$PRIVKEY" 2>/dev/null || echo "$PRIVKEY")

# Debug output
echo "🔍 USE_MANUAL_CERTS          = $USE_MANUAL_CERTS"
echo "🔍 DOMAIN_HOST               = $DOMAIN_HOST"
echo "🔍 GLOBAL_PREFIX             = $GLOBAL_PREFIX"
echo "🔍 FULLCHAIN (raw) path      = $FULLCHAIN"
echo "🔍 PRIVKEY   (raw) path      = $PRIVKEY"
echo "🔍 Resolved fullchain path   = $RESOLVED_FULLCHAIN"
echo "🔍 Resolved privkey path     = $RESOLVED_PRIVKEY"

# Decide cert mode
if [[ "${ACME_MODE:-}" == "1" ]]; then
  TEMPLATE="$ACME_TEMPLATE"
  SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
  SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
  echo '📡 ACME_MODE=1 – temporary HTTP-only config'

elif [[ "$USE_MANUAL_CERTS" == "true" && -s "$RESOLVED_FULLCHAIN" && -s "$RESOLVED_PRIVKEY" ]]; then
  TEMPLATE="$TLS_TEMPLATE"
  SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
  SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.pem"
  echo '✅ Using manual certs found in live folder'

elif [[ -s "$RESOLVED_FULLCHAIN" && -s "$RESOLVED_PRIVKEY" && "$(openssl x509 -in "$RESOLVED_FULLCHAIN" -noout -issuer 2>/dev/null | grep -qi 'Let'" && echo true)" == "true" ]]; then
  TEMPLATE="$TLS_TEMPLATE"
  SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
  SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.pem"
  echo '✅ Valid Let’s Encrypt cert detected – full HTTPS config'

else
  TEMPLATE="$SELF_TEMPLATE"
  SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
  SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
  echo '⚠️  No valid cert found — falling back to self-signed'
fi

# Export for envsubst
export DOMAIN_HOST SSL_CERT_PATH SSL_KEY_PATH GLOBAL_PREFIX

# Render final config
echo "🔒 Using cert: $SSL_CERT_PATH"
echo "🔑 Using key:  $SSL_KEY_PATH"
envsubst '${DOMAIN_HOST} ${SSL_CERT_PATH} ${SSL_KEY_PATH} ${GLOBAL_PREFIX}' \
  < "$TEMPLATE" > "$OUTPUT_CONF"
echo "✅ Generated: $OUTPUT_CONF"
