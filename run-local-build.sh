#!/usr/bin/env bash
set -e

# --- Detect if inside VM ---
IS_VM=false
if [ -f /etc/multipass-info ]; then
  IS_VM=true
elif grep -qi multipass /proc/1/cgroup 2>/dev/null; then
  IS_VM=true
elif hostname | grep -q avahi-vm; then
  IS_VM=true
fi

# --- Prompt for build type ---
echo ""
echo "🔧 Please choose the build type:"
PS3="Select an option (1/2): "
options=("Dev (dev mode)" "Production (local area network)" "Exit")
select BUILD_TYPE in "${options[@]}"; do
  case "$BUILD_TYPE" in
    "Dev (dev mode)")
      echo ""
      echo "🚀 Running development build using ./scripts/run-dev.sh ..."
      ./scripts/run-dev.sh
      exit 0
      ;;
    "Production (local area network)")
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

# --- Shared Setup (for Production only) ---
if [[ "$1" != "--vm-mode" ]]; then
  echo ""
  echo "🔧 Preparing your local environment..."

  if [ ! -x "./setup.sh" ]; then
    echo "🔐 Fixing permission for setup.sh"
    chmod +x ./setup.sh 2>/dev/null || sudo chmod +x ./setup.sh
  fi

  echo "🔧 Running setup tasks..."
  ./setup.sh
fi

# --- VM Mode ---
if [[ "$1" == "--vm-mode" || "$IS_VM" == "true" ]]; then
  echo ""
  echo "🚀 Running production Docker stack inside VM (local area network)..."

  export NODE_ENV=production
  export VM_MODE=true

  echo "📦 Sourcing .env and .env.localareanetwork..."
  set -a
  [ -f ./docker/.env ] && source ./docker/.env
  [ -f ./apps/backend/.env.localareanetwork ] && source ./apps/backend/.env.localareanetwork
  [ -f ./apps/frontend/homepage-app/.env.localareanetwork ] && source ./apps/frontend/homepage-app/.env.localareanetwork
  set +a

  echo "🚀 Starting Docker Compose for VM/production..."
  docker compose -f docker/docker-compose-local-area-network.yml up --build
  exit 0
fi

# --- Local Production Mode (non-VM) ---
OS_NAME=$(uname -s)
IS_UBUNTU=false
if [ "$OS_NAME" == "Linux" ]; then
  DISTRO_ID=$(grep '^ID=' /etc/os-release | cut -d= -f2)
  if [ "$DISTRO_ID" == "ubuntu" ]; then
    IS_UBUNTU=true
  fi
fi

if [ "$IS_UBUNTU" == "true" ]; then
  echo "📦 Sourcing .env and .env.localareanetwork..."
  set -a
  [ -f ./docker/.env ] && source ./docker/.env
  [ -f ./apps/backend/.env.localareanetwork ] && source ./apps/backend/.env.localareanetwork
  [ -f ./apps/frontend/homepage-app/.env.localareanetwork ] && source ./apps/frontend/homepage-app/.env.localareanetwork
  set +a

  echo "🚀 Running on Ubuntu. Proceeding with local production build..."
  docker compose -f docker/docker-compose-local-area-network.yml build --no-cache
  docker compose -f docker/docker-compose-local-area-network.yml up
else
  echo "🧠 Detected non-Ubuntu system ($OS_NAME). Running production build inside VM..."
  # Only run bridge script if not already in VM
  if [ "$IS_VM" != "true" ]; then
    ./scripts/internal/create-virtual-bridge.sh
  fi
  ./scripts/internal/run-in-vm.sh
fi
