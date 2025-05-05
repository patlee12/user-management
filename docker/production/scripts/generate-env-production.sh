#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# === FILE PATHS ===
SHARED_ENV="$ROOT_DIR/docker/production/.env.production"
BACKEND_ENV="$ROOT_DIR/apps/backend/.env"
FRONTEND_ENV="$ROOT_DIR/apps/frontend/homepage-app/.env"
LOG_DIR="$ROOT_DIR/docker/production/scripts/env-logs"

# === TEMPLATE PATHS ===
SHARED_TEMPLATE="$ROOT_DIR/docker/production/.env.production.template"
BACKEND_TEMPLATE="$ROOT_DIR/apps/backend/.env.template"
BACKEND_PROD_TEMPLATE="$ROOT_DIR/apps/backend/.env.production.template"
FRONTEND_TEMPLATE="$ROOT_DIR/apps/frontend/homepage-app/.env.template"
FRONTEND_PROD_TEMPLATE="$ROOT_DIR/apps/frontend/homepage-app/.env.production.template"

mkdir -p "$LOG_DIR"

for file in \
  "$SHARED_TEMPLATE" \
  "$BACKEND_TEMPLATE" \
  "$BACKEND_PROD_TEMPLATE" \
  "$FRONTEND_TEMPLATE" \
  "$FRONTEND_PROD_TEMPLATE"; do
  [[ ! -f "$file" ]] && echo "❌ Missing template: $file" && exit 1
done

if [[ -f "$SHARED_ENV" || -f "$BACKEND_ENV" || -f "$FRONTEND_ENV" ]]; then
  echo "⚠️  Existing .env files detected."
  read -rp "Overwrite them? (y/N): " choice
  case "$choice" in
    [yY][eE][sS]|[yY]) echo "✅ Overwriting..." ;;
    *) echo "✅ Skipping generation."; exit 0 ;;
  esac
fi

# === PROMPTS ===
read -rp "Enter DOMAIN_HOST (e.g. example.com): " DOMAIN_HOST
DOMAIN_HOST=$(echo "$DOMAIN_HOST" | tr -d '\r\n')

read -rp "Use manually uploaded certificates instead of Let's Encrypt? (y/N): " manual_cert
case "$manual_cert" in
  [yY][eE][sS]|[yY]) USE_MANUAL_CERTS=true ;;
  *) USE_MANUAL_CERTS=false ;;
esac

read -rp "Enter ADMIN_EMAIL: " ADMIN_EMAIL
ADMIN_EMAIL=$(echo "$ADMIN_EMAIL" | tr -d '\r\n')

read -rp "Enter MAIL_SERVICE_PROVIDER: " MAIL_SERVICE_PROVIDER
read -rp "Enter EMAIL_USER: " EMAIL_USER
read -rsp "Enter EMAIL_PASS: " EMAIL_PASS && echo

read -rp "Enter NEXT_PUBLIC_SUPPORT_EMAIL (leave blank to use ADMIN_EMAIL): " NEXT_PUBLIC_SUPPORT_EMAIL
NEXT_PUBLIC_SUPPORT_EMAIL="${NEXT_PUBLIC_SUPPORT_EMAIL:-$ADMIN_EMAIL}"

# === OAUTH PROMPT ===
read -rp "Enable OAuth login? (y/N): " enable_oauth
case "$enable_oauth" in
  [yY][eE][sS]|[yY]) ENABLE_OAUTH=true ;;
  *) ENABLE_OAUTH=false ;;
esac

if [[ "$ENABLE_OAUTH" == "true" ]]; then
  read -rp "Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_ID=$(echo "$GOOGLE_CLIENT_ID" | tr -d '\r\n')
fi

# === SECRETS ===
ADMIN_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)
JWT_SECRET=$(openssl rand -base64 256)
MFA_KEY=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -base64 256)
PUBLIC_SESSION_SECRET=$(openssl rand -base64 256)
GOOGLE_CLIENT_SECRET=$(openssl rand -base64 64)

quote() {
  printf '"%s"' "$(echo "$1" | sed 's/["\\]/\\&/g')"
}

dedupe_env_file() {
  local file="$1"
  tac "$file" \
    | awk -F= '!a[$1]++' \
    | tac > "${file}.tmp" \
    && mv "${file}.tmp" "$file"
  sed -i '/^\s*$/d' "$file"
}

resolve_and_merge_templates() {
  local template1="$1"
  local template2="$2"
  local output="$3"

  cat /dev/null > "$output"

  for template in "$template1" "$template2"; do
    while IFS= read -r line || [[ -n "$line" ]]; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      key="${line%%=*}"
      val="${line#*=}"
      resolved_val=$(eval echo "$val")
      escaped_val=$(quote "$resolved_val")

      if grep -q "^${key}=" "$output"; then
        sed -i "s|^${key}=.*|${key}=${escaped_val}|" "$output"
      else
        echo "${key}=${escaped_val}" >> "$output"
      fi
    done < "$template"
  done
}

POSTGRES_USER=$(grep '^POSTGRES_USER=' "$SHARED_TEMPLATE" \
  | cut -d '=' -f2- | tr -d '"')
POSTGRES_DB=$(grep '^POSTGRES_DB=' "$SHARED_TEMPLATE" \
  | cut -d '=' -f2- | tr -d '"')
POSTGRES_PASSWORD=$(openssl rand -base64 48 \
  | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)

# === SHARED ENV ===
echo "🔐 Generating $SHARED_ENV..."
cp "$SHARED_TEMPLATE" "$SHARED_ENV"
{
  echo "# === Shared Secrets (Generated)"
  echo "POSTGRES_USER=$(quote "$POSTGRES_USER")"
  echo "POSTGRES_PASSWORD=$(quote "$POSTGRES_PASSWORD")"
  echo "POSTGRES_DB=$(quote "$POSTGRES_DB")"
  echo "ADMIN_EMAIL=$(quote "$ADMIN_EMAIL")"
  echo "ADMIN_PASSWORD=$(quote "$ADMIN_PASSWORD")"
  echo "JWT_SECRET=$(quote "$JWT_SECRET")"
  echo "MFA_KEY=$(quote "$MFA_KEY")"
  echo "COOKIE_SECRET=$(quote "$COOKIE_SECRET")"
  echo "PUBLIC_SESSION_SECRET=$(quote "$PUBLIC_SESSION_SECRET")"
  echo "DOMAIN_HOST=$(quote "$DOMAIN_HOST")"
  echo "USE_MANUAL_CERTS=$(quote "$USE_MANUAL_CERTS")"
  echo "MAIL_SERVICE_PROVIDER=$(quote "$MAIL_SERVICE_PROVIDER")"
  echo "EMAIL_USER=$(quote "$EMAIL_USER")"
  echo "EMAIL_PASS=$(quote "$EMAIL_PASS")"
} >> "$SHARED_ENV"
dedupe_env_file "$SHARED_ENV"
echo "✅ Created $SHARED_ENV"

# === BACKEND ENV ===
echo "⚙️  Generating $BACKEND_ENV..."
resolve_and_merge_templates "$BACKEND_TEMPLATE" "$BACKEND_PROD_TEMPLATE" "$BACKEND_ENV"
{
  echo "# === Injected Shared Vars"
  echo "POSTGRES_USER=$(quote "$POSTGRES_USER")"
  echo "POSTGRES_PASSWORD=$(quote "$POSTGRES_PASSWORD")"
  echo "POSTGRES_DB=$(quote "$POSTGRES_DB")"
  echo "DATABASE_URL=$(quote "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}")"
  echo "MAIL_SERVICE_PROVIDER=$(quote "$MAIL_SERVICE_PROVIDER")"
  echo "EMAIL_USER=$(quote "$EMAIL_USER")"
  echo "EMAIL_PASS=$(quote "$EMAIL_PASS")"
  echo "JWT_SECRET=$(quote "$JWT_SECRET")"
  echo "MFA_KEY=$(quote "$MFA_KEY")"
  echo "COOKIE_SECRET=$(quote "$COOKIE_SECRET")"
  echo "PUBLIC_SESSION_SECRET=$(quote "$PUBLIC_SESSION_SECRET")"
  echo "DOMAIN_HOST=$(quote "$DOMAIN_HOST")"
  echo "ENABLE_OAUTH=$(quote "$ENABLE_OAUTH")"
  if [[ "$ENABLE_OAUTH" == "true" ]]; then
    echo "GOOGLE_CLIENT_ID=$(quote "$GOOGLE_CLIENT_ID")"
    echo "GOOGLE_CLIENT_SECRET=$(quote "$GOOGLE_CLIENT_SECRET")"
  else
    echo "GOOGLE_CLIENT_ID=$(quote "")"
    echo "GOOGLE_CLIENT_SECRET=$(quote "")"
  fi
  echo "GOOGLE_CALLBACK_URL=$(quote "https://${DOMAIN_HOST}/auth/google/callback")"
} >> "$BACKEND_ENV"
dedupe_env_file "$BACKEND_ENV"
echo "✅ Created $BACKEND_ENV"

# === FRONTEND ENV ===
echo "🌐 Generating $FRONTEND_ENV..."
resolve_and_merge_templates "$FRONTEND_TEMPLATE" "$FRONTEND_PROD_TEMPLATE" "$FRONTEND_ENV"
{
  echo "# === Injected Shared Vars"
  echo "PUBLIC_SESSION_SECRET=$(quote "$PUBLIC_SESSION_SECRET")"
  echo "NEXT_PUBLIC_SUPPORT_EMAIL=$(quote "$NEXT_PUBLIC_SUPPORT_EMAIL")"
  echo "DOMAIN_HOST=$(quote "$DOMAIN_HOST")"
} >> "$FRONTEND_ENV"
dedupe_env_file "$FRONTEND_ENV"
echo "✅ Created $FRONTEND_ENV"

# === VALIDATE ===
echo "🔍 Validating $BACKEND_ENV..."
missing_vars=0
while IFS= read -r line; do
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  if [[ -z "${value//\"/}" && "$key" != "GLOBAL_PREFIX" ]]; then
    echo "❌ $key is blank in $BACKEND_ENV"
    ((missing_vars++))
  fi
done < "$BACKEND_ENV"

if [[ $missing_vars -gt 0 ]]; then
  echo ""
  echo "⚠️  Missing required values."
  read -rp "Re-run script to fix? (y/N): " fix
  [[ "$fix" =~ ^[yY]$ ]] && exec "$0" || exit 1
fi

# === LOG OUTPUT ===
timestamp=$(date "+%Y%m%d-%H%M%S")
log_file="$LOG_DIR/.env.log-${timestamp}"
{
  echo "📦 ENV SNAPSHOT — $timestamp"
  echo ""
  echo "🔧 SHARED (.env.production)"
  echo "-----------------------------"
  cat "$SHARED_ENV"
  echo ""
  echo "📂 BACKEND (.env)"
  echo "-----------------------------"
  cat "$BACKEND_ENV"
  echo ""
  echo "🖥️  FRONTEND (.env)"
  echo "-----------------------------"
  cat "$FRONTEND_ENV"
} > "$log_file"

echo "📝 Saved log to $log_file"
echo "🎉 Environment generation complete!"
