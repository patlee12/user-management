#!/bin/bash
set -e

echo ""
echo "🔧 Preparing your local environment..."

# ────────────────────────────────────────────────────────────────
# Centralized Path Variables
# ────────────────────────────────────────────────────────────────
COMPOSE_FILE="./docker/docker-compose-local-area-network.yml"
POSTGRES_VOLUME_NAME="localareanetwork-production-postgres"

ENV_FILE_DOCKER="./docker/.env"
ENV_FILE_BACKEND="./apps/backend/.env"
ENV_FILE_FRONTEND="./frontend/homepage-app/.env"

GENERATE_ENV_SCRIPT="./scripts/generate-env-files.sh"
CERT_GEN_SCRIPT="./scripts/generate-nginx-certs.sh"
EMAIL_ENV_SCRIPT="./scripts/update-email-service-env.sh"

SCRIPT_PATHS=(
  "./scripts/generate-env-files.sh"
  "./scripts/generate-nginx-certs.sh"
  "./scripts/check-prerequisites.sh"
  "./scripts/update-email-service-env.sh"
  "./scripts/internal/run-in-vm.sh"
  "./scripts/internal/create-virtual-bridge.sh"
  "./scripts/internal/setup-hyperv/enable-hyperv-tools.ps1"
  "./scripts/internal/setup-hyperv/run-enable-hyperv.bat"
  "./docker/scripts/hostname-printer.sh"
  "./docker/scripts/wait-for-containers.sh"
)

# ────────────────────────────────────────────────────────────────
# Step 1: Check for Postgres Container or Volume
# ────────────────────────────────────────────────────────────────
POSTGRES_CONTAINER_EXISTS=$(docker ps -a -q -f name=postgres)
POSTGRES_VOLUME_EXISTS=$(docker volume ls -q -f name=$POSTGRES_VOLUME_NAME)

if [ -n "$POSTGRES_CONTAINER_EXISTS" ] || [ -n "$POSTGRES_VOLUME_EXISTS" ]; then
  echo ""
  read -p "⚠️  Existing Postgres container or production volume found. Do you want to reset the environment and remove them? This will reset your PRODUCTION database. (y/n): " RESET_CONFIRM
  if [[ "$RESET_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "🚀 Resetting the environment..."
    docker compose -f "$COMPOSE_FILE" down -v
    docker volume rm "$POSTGRES_VOLUME_NAME" || true
    echo "✅ Postgres container and production volume have been removed."
  else
    echo "👍 Skipping reset. Existing data will be used."
  fi
fi

# ────────────────────────────────────────────────────────────────
# Step 2: Ensure Shell Scripts Are Executable
# ────────────────────────────────────────────────────────────────
echo "🔐 Ensuring all shell scripts are executable..."
for script in "${SCRIPT_PATHS[@]}"; do
  if [ ! -x "$script" ]; then
    echo "🔐 Fixing permission for $script"
    chmod +x "$script" 2>/dev/null || {
      echo "❌ Permission denied. Please run: chmod +x $script"
      exit 1
    }
  fi
done

# ────────────────────────────────────────────────────────────────
# Step 3: Check for Existing .env Files
# ────────────────────────────────────────────────────────────────
ENV_FILES_EXIST=false
if [ -f "$ENV_FILE_DOCKER" ] || [ -f "$ENV_FILE_BACKEND" ] || [ -f "$ENV_FILE_FRONTEND" ]; then
  ENV_FILES_EXIST=true
fi

if [ "$ENV_FILES_EXIST" = true ]; then
  echo ""
  read -p "⚠️  Detected .env files already exist. Do you want to regenerate them? (Warning: this will regenerate passwords) (y/n): " REGEN_CONFIRM
  if [[ "$REGEN_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "🔁 Regenerating .env files..."
    "$GENERATE_ENV_SCRIPT"
  else
    echo "✅ Keeping existing .env files."
  fi
else
  echo "📄 No existing .env files found. Generating fresh ones..."
  "$GENERATE_ENV_SCRIPT"
fi

# ────────────────────────────────────────────────────────────────
# Step 4: Update Email Service Environment Variables
# ────────────────────────────────────────────────────────────────
"$EMAIL_ENV_SCRIPT"

# ────────────────────────────────────────────────────────────────
# Step 5: Generate HTTPS Dev Certs
# ────────────────────────────────────────────────────────────────
echo ""
echo "🔒 Generating NGINX dev certificates (if missing)..."
"$CERT_GEN_SCRIPT"

# ────────────────────────────────────────────────────────────────
# Step 6: Make This Script Executable If Needed
# ────────────────────────────────────────────────────────────────
if [ ! -x "$0" ]; then
  echo "📦 Making setup.sh executable for future runs..."
  chmod +x "$0" 2>/dev/null || {
    echo "❌ Permission denied. Please run 'chmod +x setup.sh' manually to proceed."
    exit 1
  }
fi

# Done
echo ""
echo "✅ Setup complete. You can now run the development or production build via the run-local-build.sh script."
