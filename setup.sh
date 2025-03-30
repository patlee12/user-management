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
    # Remove the Postgres container and volume
    echo "🚀 Resetting the environment..."
    docker compose -f docker/docker-compose-local-area-network.yml down -v # Ensure path to your specific docker-compose file
    echo "✅ Postgres container and volume have been removed."
  else
    echo "👍 Skipping reset. Existing data will be used."
  fi
fi

# Step 3: Make sure the necessary shell scripts are executable
echo "🔐 Ensuring all shell scripts are executable..."
SCRIPTS=("scripts/generate-env-files.sh" "scripts/generate-nginx-certs.sh" "scripts/check-prerequisites.sh" "scripts/update-email-service-env.sh")

# Ensure all required scripts are executable
for script in "${SCRIPTS[@]}"; do
  if [ ! -x "$script" ]; then
    echo "🔐 Fixing permission for $script"
    chmod +x "$script" 2>/dev/null || {
      echo "❌ Permission denied. Please run 'chmod +x $script' manually to proceed."
      exit 1
    }
  fi
done

# Make setup.sh executable (if it was downloaded as non-executable)
if [ ! -x "$0" ]; then
  echo "📦 Making setup.sh executable for future runs..."
  chmod +x "$0" 2>/dev/null || {
    echo "❌ Permission denied. Please run 'chmod +x setup.sh' manually to proceed."
    exit 1
  }
fi

# Step 4: Running setup tasks
echo ""
echo "🔧 Running setup steps..."
./scripts/generate-env-files.sh
./scripts/generate-nginx-certs.sh

echo ""
echo "🔧 Setup complete. You can now run the development or production build via the run-local-build.sh script."
