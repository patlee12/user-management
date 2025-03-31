#!/bin/bash

set -e

echo ""
echo "🔧 Preparing your local environment..."

# Step 1: Check if Postgres container or volume exists
POSTGRES_CONTAINER_EXISTS=$(docker ps -a -q -f name=postgres)
POSTGRES_VOLUME_EXISTS=$(docker volume ls -q -f name=postgres)

# Step 2: Ask if the user wants to reset the environment and remove containers/volumes
if [ -n "$POSTGRES_CONTAINER_EXISTS" ] || [ -n "$POSTGRES_VOLUME_EXISTS" ]; then
  echo ""
  read -p "⚠️ Existing Postgres container or volume found. Do you want to reset the environment and remove existing containers and volumes? This will reset your database. (y/n): " RESET_CONFIRM
  if [[ "$RESET_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "🚀 Resetting the environment..."
    docker compose -f docker/docker-compose-local-area-network.yml down -v
    echo "✅ Postgres container and volume have been removed."
  else
    echo "👍 Skipping reset. Existing data will be used."
  fi
fi

# Step 3: Make sure the necessary shell scripts are executable
echo "🔐 Ensuring all shell scripts are executable..."
SCRIPTS=("scripts/generate-env-files.sh" "scripts/generate-nginx-certs.sh" "scripts/check-prerequisites.sh" "scripts/update-email-service-env.sh")

for script in "${SCRIPTS[@]}"; do
  if [ ! -x "$script" ]; then
    echo "🔐 Fixing permission for $script"
    chmod +x "$script" 2>/dev/null || {
      echo "❌ Permission denied. Please run 'chmod +x $script' manually to proceed."
      exit 1
    }
  fi
done

# Step 4: Prompt if any .env files already exist
ENV_FILES_EXIST=false
if [ -f "./docker/.env" ] || [ -f "./apps/backend/.env" ] || [ -f "./frontend/homepage-app/.env" ]; then
  ENV_FILES_EXIST=true
fi

if [ "$ENV_FILES_EXIST" = true ]; then
  echo ""
  read -p "⚠️ Detected .env files already exist. Do you want to regenerate them? (Warning: this will regenerate passwords) (y/n): " REGEN_CONFIRM
  if [[ "$REGEN_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "🔁 Regenerating .env files..."
    ./scripts/generate-env-files.sh
  else
    echo "✅ Keeping existing .env files."
  fi
else
  echo "📄 No existing .env files found. Generating fresh ones..."
  ./scripts/generate-env-files.sh
fi

# Step 5: Always run cert generation
echo ""
echo "🔒 Generating NGINX dev certificates (if missing)..."
./scripts/generate-nginx-certs.sh

# Step 6: Make this script executable for future runs (if needed)
if [ ! -x "$0" ]; then
  echo "📦 Making setup.sh executable for future runs..."
  chmod +x "$0" 2>/dev/null || {
    echo "❌ Permission denied. Please run 'chmod +x setup.sh' manually to proceed."
    exit 1
  }
fi

echo ""
echo "✅ Setup complete. You can now run the development or production build via the run-local-build.sh script."
