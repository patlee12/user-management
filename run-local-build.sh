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

# Ask the user to select the build type (Dev or Production) using select
echo ""
echo "🔧 Please choose the build type:"
PS3="Select an option (1/2): "
options=("Dev (dev mode)" "Production (local area network)" "Exit")
select BUILD_TYPE in "${options[@]}"
do
    case $BUILD_TYPE in
        "Dev (dev mode)")
            echo ""
            echo "🚀 Running development build (yarn dev)..."
            yarn dev
            break
            ;;
        "Production (local area network)")
            echo ""
            echo "🚀 Running email service configuration..."
            ./scripts/update-email-service-env.sh # Update to the correct script name
            echo "🚀 Starting Docker stack for production (local area network)..."
            docker compose -f docker/docker-compose-local-area-network.yml up --build
            break
            ;;
        "Exit")
            echo "Exiting the setup."
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please select a valid option (1/2)."
            ;;
    esac
done
