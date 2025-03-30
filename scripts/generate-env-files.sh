#!/bin/bash

set -e

# Secure password generation
POSTGRES_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)
ADMIN_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)
JWT_SECRET=$(openssl rand -base64 256)
MFA_KEY=$(openssl rand -hex 256)
COOKIE_SECRET=$(openssl rand -base64 256)

# File paths
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_TEMPLATE="$ROOT_DIR/docker/.env.template"
BACKEND_TEMPLATE="$ROOT_DIR/apps/backend/.env.template"
FRONTEND_TEMPLATE="$ROOT_DIR/apps/frontend/homepage-app/.env.template"

DOCKER_ENV="$ROOT_DIR/docker/.env"
BACKEND_ENV="$ROOT_DIR/apps/backend/.env"
FRONTEND_ENV="$ROOT_DIR/apps/frontend/homepage-app/.env"

# Helper to generate env from template
generate_env_file() {
  local template="$1"
  local output="$2"
  shift 2
  local updates=("$@")

  if [[ ! -f "$template" ]]; then
    echo "❌ Template not found: $template"
    exit 1
  fi

  echo "🔧 Generating $output from $template"

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^([A-Z0-9_]+)= ]]; then
      key="${BASH_REMATCH[1]}"
      for kv in "${updates[@]}"; do
        k="${kv%%=*}"
        v="${kv#*=}"
        if [[ "$key" == "$k" ]]; then
          line="$key=\"$v\""
        fi
      done
    fi
    echo "$line"
  done < "$template" > "$output"

  echo "✅ Generated: $output"
}

# Generate docker/.env
generate_env_file "$DOCKER_TEMPLATE" "$DOCKER_ENV" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD"

# Generate backend/.env
generate_env_file "$BACKEND_TEMPLATE" "$BACKEND_ENV" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  JWT_SECRET="$JWT_SECRET" \
  MFA_KEY="$MFA_KEY" \
  COOKIE_SECRET="$COOKIE_SECRET"

# Copy frontend env as-is
cp "$FRONTEND_TEMPLATE" "$FRONTEND_ENV"
echo "✅ Copied: $FRONTEND_TEMPLATE -> $FRONTEND_ENV"
