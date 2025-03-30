#!/bin/bash

set -e

echo ""
echo "🔧 Preparing your local environment..."

# Ensure setup.sh is executable
if [ ! -x "./setup.sh" ]; then
  echo "🔐 Fixing permission for setup.sh"
  chmod +x ./setup.sh 2>/dev/null || {
    echo "🔐 Permission denied. Trying with sudo..."
    sudo chmod +x ./setup.sh
  }
fi

# Run environment setup tasks (call setup.sh)
echo "🔧 Running setup tasks..."
./setup.sh

# Ask the user to select the build type (Dev or Production)
echo ""
read -p "⚙️ Do you want to run the Dev build (dev mode) or the Production build (local area network)? (dev/production): " BUILD_TYPE

if [[ "$BUILD_TYPE" == "dev" || "$BUILD_TYPE" == "Dev" ]]; then
  echo ""
  echo "🚀 Running development build (yarn dev)..."
  yarn dev
elif [[ "$BUILD_TYPE" == "production" || "$BUILD_TYPE" == "Production" ]]; then
  echo ""
  echo "🚀 Running email service configuration..."
  ./scripts/update-email-service-env.sh # Update to the correct script name
  echo "🚀 Starting Docker stack for production (local area network)..."
  docker compose -f docker/docker-compose-local-area-network.yml up --build
else
  echo "❌ Invalid input. Please choose either 'dev' or 'production'."
  exit 1
fi
