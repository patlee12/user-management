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

DOMAIN_HOST=$(grep '^DOMAIN_HOST='       "$ENV_FILE" | cut -d= -f2- | tr -d '\"' | xargs)
GLOBAL_PREFIX=$(grep '^GLOBAL_PREFIX='   "$ENV_FILE" | cut -d= -f2- | tr -d '\"' | xargs || true)
USE_MANUAL_CERTS=$(grep '^USE_MANUAL_CERTS=' "$ENV_FILE" | cut -d= -f2- | tr -d '\"' | xargs || echo "false")
GLOBAL_PREFIX="${GLOBAL_PREFIX:-}"

LIVE_DIR="$ROOT_DIR/docker/production/nginx/certs/live/$DOMAIN_HOST"
FULLCHAIN="$LIVE_DIR/fullchain.pem"
PRIVKEY="$LIVE_DIR/privkey.pem"


# Decide which cert

case 1 in
  $([[ "${ACME_MODE:-}" == "1" ]] && echo 1))
    TEMPLATE=$ACME_TEMPLATE
    SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
    SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
    echo '📡 ACME_MODE=1 – temporary HTTP‑only config'
    ;;

  $([[ "$USE_MANUAL_CERTS" == "true" && -s "$FULLCHAIN" && -s "$PRIVKEY" ]] && echo 1))
    TEMPLATE=$TLS_TEMPLATE
    SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
    SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.pem"
    echo '✅ Using manual certs found in live folder'
    ;;

  $([[ -s "$FULLCHAIN" && -s "$PRIVKEY" ]] && openssl x509 -in "$FULLCHAIN" -noout -issuer 2>/dev/null | grep -qi \"Let's Encrypt\" && echo 1))
    TEMPLATE=$TLS_TEMPLATE
    SSL_CERT_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/fullchain.pem"
    SSL_KEY_PATH="/etc/nginx/certs/live/$DOMAIN_HOST/privkey.pem"
    echo '✅ Valid Let’s Encrypt cert detected – full HTTPS config'
    ;;

  *)
    TEMPLATE=$SELF_TEMPLATE
    SSL_CERT_PATH="/etc/nginx/certs/self-signed/server.crt"
    SSL_KEY_PATH="/etc/nginx/certs/self-signed/server.key"
    echo '⚠️  Falling back to self‑signed certs'
    ;;
esac

echo "🔒 Using cert: $SSL_CERT_PATH"
echo "🔑 Using key:  $SSL_KEY_PATH"

export DOMAIN_HOST SSL_CERT_PATH SSL_KEY_PATH GLOBAL_PREFIX

# Render final config
envsubst '${DOMAIN_HOST} ${SSL_CERT_PATH} ${SSL_KEY_PATH} ${GLOBAL_PREFIX}' \
  < "$TEMPLATE" > "$OUTPUT_CONF"

echo "✅ Generated: $OUTPUT_CONF"
