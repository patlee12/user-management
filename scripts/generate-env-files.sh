#!/bin/bash

set -e

# Secure password generation
POSTGRES_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)
ADMIN_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32)
JWT_SECRET=$(openssl rand -base64 256)
PUBLIC_SESSION_SECRET=$(openssl rand -base64 256)
MFA_KEY=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -base64 256)

# Prompt for admin email
read -rp "Enter ADMIN_EMAIL for the admin account: " ADMIN_EMAIL

# File paths
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_TEMPLATE="$ROOT_DIR/docker/.env.template"
BACKEND_TEMPLATE="$ROOT_DIR/apps/backend/.env.template"
FRONTEND_TEMPLATE="$ROOT_DIR/apps/frontend/homepage-app/.env.template"

DOCKER_ENV="$ROOT_DIR/docker/.env"
BACKEND_ENV="$ROOT_DIR/apps/backend/.env"
FRONTEND_ENV="$ROOT_DIR/apps/frontend/homepage-app/.env"

# Local area network .env files
BACKEND_LOCAL_TEMPLATE="$ROOT_DIR/apps/backend/.env.localareanetwork.template"
FRONTEND_LOCAL_TEMPLATE="$ROOT_DIR/apps/frontend/homepage-app/.env.localareanetwork.template"

BACKEND_LOCAL="$ROOT_DIR/apps/backend/.env.localareanetwork"
FRONTEND_LOCAL="$ROOT_DIR/apps/frontend/homepage-app/.env.localareanetwork"

# Helper to generate env from template and then remove CR characters using Perl
generate_env_file() {
  local template="$1"
  local output="$2"
  shift 2
  local updates=("${@}")

  if [[ ! -f "$template" ]]; then
    echo "❌ Template not found: $template"
    exit 1
  fi

  echo "🔧 Generating $output from $template"

  # Process each line from the template, remove any CRs, and update keys as needed.
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Remove any carriage return characters from the line
    line="${line//$'\r'/}"
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

  # Use Perl to ensure any remaining \r characters are removed
  perl -pi -e 's/\r//g' "$output"

  echo "✅ Generated: $output"
}

# Generate docker/.env with ADMIN_EMAIL
generate_env_file "$DOCKER_TEMPLATE" "$DOCKER_ENV" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  ADMIN_EMAIL="$ADMIN_EMAIL"

# Generate backend/.env
generate_env_file "$BACKEND_TEMPLATE" "$BACKEND_ENV" \
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  JWT_SECRET="$JWT_SECRET" \
  PUBLIC_SESSION_SECRET="$PUBLIC_SESSION_SECRET" \
  MFA_KEY="$MFA_KEY" \
  COOKIE_SECRET="$COOKIE_SECRET"

# Generate frontend/homepage-app/.env
generate_env_file "$FRONTEND_TEMPLATE" "$FRONTEND_ENV" \
  PUBLIC_SESSION_SECRET="$PUBLIC_SESSION_SECRET"

# Generate backend/.env.localareanetwork if its template exists
if [[ -f "$BACKEND_LOCAL_TEMPLATE" ]]; then
  generate_env_file "$BACKEND_LOCAL_TEMPLATE" "$BACKEND_LOCAL" \
    POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    JWT_SECRET="$JWT_SECRET" \
    PUBLIC_SESSION_SECRET="$PUBLIC_SESSION_SECRET" \
    MFA_KEY="$MFA_KEY" \
    COOKIE_SECRET="$COOKIE_SECRET"
fi

# Generate frontend/homepage-app/.env.localareanetwork if its template exists
if [[ -f "$FRONTEND_LOCAL_TEMPLATE" ]]; then
  generate_env_file "$FRONTEND_LOCAL_TEMPLATE" "$FRONTEND_LOCAL" \
    PUBLIC_SESSION_SECRET="$PUBLIC_SESSION_SECRET"
fi
