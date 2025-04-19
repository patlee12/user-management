#!/usr/bin/env bash
set -euo pipefail

# ──────────────── Path resolution ────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/production/.env.production"

# ──────────────── Load env vars ────────────────
[[ -f "$ENV_FILE" ]] || { echo "❌ $ENV_FILE not found"; exit 1; }

# strip quotes / whitespace
DOMAIN_HOST=$(awk -F= '/^DOMAIN_HOST=/ {gsub(/["\r\n ]/, "", $2); print $2; exit}' "$ENV_FILE")
ADMIN_EMAIL=$(awk -F= '/^ADMIN_EMAIL=/ {gsub(/["\r\n ]/, "", $2); print $2; exit}' "$ENV_FILE")
CERTBOT_STAGE=$(awk -F= '/^CERTBOT_STAGE=/ {gsub(/["\r\n ]/, "", $2); print $2; exit}' "$ENV_FILE")

[[ -n "$DOMAIN_HOST"  ]] || { echo "❌ DOMAIN_HOST not set";  exit 1; }
[[ -n "$ADMIN_EMAIL"  ]] || { echo "❌ ADMIN_EMAIL not set";  exit 1; }

# ──────────────── Domain list ────────────────
DOMAINS=(
  "$DOMAIN_HOST"
  "admin.$DOMAIN_HOST"
  "api.$DOMAIN_HOST"
  "swagger.$DOMAIN_HOST"
)

echo "🔍 Verifying DNS for requested hosts…"
GOOD_DOMAINS=()
for host in "${DOMAINS[@]}"; do
  if dig +short "$host" | grep -qE '^[0-9]'; then
    echo " ✓ $host → $(dig +short "$host" | head -1)"
    GOOD_DOMAINS+=("$host")
  else
    echo " ✗ $host has no A/AAAA record – will be skipped"
  fi
done

[[ ${#GOOD_DOMAINS[@]} -gt 0 ]] || { echo "❌ No resolvable domains left – aborting"; exit 1; }

# ──────────────── HTTP‑01 reachability test ────────────────
echo "🔍 Verifying port 80 reachability…"
TOKEN="pretest-$(date +%s)"
WEBROOT="$ROOT_DIR/docker/production/nginx/www"
mkdir -p "$WEBROOT/.well-known/acme-challenge"
echo ok > "$WEBROOT/.well-known/acme-challenge/$TOKEN"

FAILED=false
for host in "${GOOD_DOMAINS[@]}"; do
  if ! curl -fs "http://${host}/.well-known/acme-challenge/$TOKEN" >/dev/null; then
    echo " ✗ $host is not reachable on port 80 (HTTP‑01 will fail)"
    FAILED=true
  else
    echo " ✓ $host reachable on port 80"
  fi
done
$FAILED && { echo "❌ Fix port 80 reachability and retry"; exit 1; }

# ──────────────── Invoke Certbot ────────────────
echo -e "\n🔐 Requesting Let's Encrypt certificate for:"
printf ' • %s\n' "${GOOD_DOMAINS[@]}"

CERTBOT_OPTS=(
  certonly
  --webroot -w /var/www/certbot
  --email "$ADMIN_EMAIL"
  --agree-tos --no-eff-email --non-interactive --verbose
)
[[ "${CERTBOT_STAGE,,}" == "true" ]] && CERTBOT_OPTS+=( --staging )

if ! docker run --rm \
  -v "$ROOT_DIR/docker/production/nginx/certs:/etc/letsencrypt" \
  -v "$ROOT_DIR/docker/production/nginx/www:/var/www/certbot" \
  certbot/certbot "${CERTBOT_OPTS[@]}" $(printf -- '-d %s ' "${GOOD_DOMAINS[@]}"); then
  echo "❌ Certbot failed – falling back to self‑signed certs"
  exit 2
fi

echo "✅ Certificate obtained for: ${GOOD_DOMAINS[*]}"
