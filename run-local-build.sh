#!/usr/bin/env bash
set -e

# ────────────────────────────────────────────────────────────────
# Path Variables
# ────────────────────────────────────────────────────────────────
ROOT_DIR="$(pwd)"
DEV_SCRIPT="$ROOT_DIR/scripts/run-dev.sh"
PROD_SCRIPT="$ROOT_DIR/docker/production/scripts/run-production-build.sh"
SETUP_SCRIPT="$ROOT_DIR/setup.sh"
VIRTUAL_BRIDGE_SCRIPT="$ROOT_DIR/scripts/internal/create-virtual-bridge.sh"
RUN_IN_VM_SCRIPT="$ROOT_DIR/scripts/internal/run-in-vm.sh"

ENV_DOCKER="$ROOT_DIR/docker/.env"
ENV_BACKEND="$ROOT_DIR/apps/backend/.env.localareanetwork"
ENV_FRONTEND="$ROOT_DIR/apps/frontend/homepage-app/.env.localareanetwork"

LAN_COMPOSE_FILE="$ROOT_DIR/docker/docker-compose-local-area-network.yml"

# ────────────────────────────────────────────────────────────────
# VM Detection
# ────────────────────────────────────────────────────────────────
IS_VM=false
if [ -f /etc/multipass-info ]; then
  IS_VM=true
elif grep -qi multipass /proc/1/cgroup 2>/dev/null; then
  IS_VM=true
elif hostname | grep -q avahi-vm; then
  IS_VM=true
fi

# ────────────────────────────────────────────────────────────────
# Prompt for Build Type
# ────────────────────────────────────────────────────────────────
echo ""
echo "🔧 Please choose the build type:"
PS3="Select an option (1/2/3): "
options=(
  "Dev (dev mode)"
  "Production Local Area Network (.local) deployment"
  "Production Build (With Domain and Subdomains)"
  "Exit"
)
select BUILD_TYPE in "${options[@]}"; do
  case "$BUILD_TYPE" in
    "Dev (dev mode)")
      echo ""
      echo "🚀 Running development build using $DEV_SCRIPT ..."
      $DEV_SCRIPT
      exit 0
      ;;
    "Production Local Area Network (.local) deployment")
      break
      ;;
    "Production Build (With Domain and Subdomains)")
      echo ""
      echo "🚀 Running full production build using $PROD_SCRIPT ..."
      $PROD_SCRIPT
      exit 0
      ;;
    "Exit")
      echo "Exiting the setup."
      exit 0
      ;;
    *)
      echo "❌ Invalid option. Please select a valid option (1/2/3)."
      ;;
  esac
done

# ────────────────────────────────────────────────────────────────
# Shared Setup (for LAN Production only)
# ────────────────────────────────────────────────────────────────
if [[ "$1" != "--vm-mode" ]]; then
  echo ""
  echo "🔧 Preparing your local environment..."

  if [ ! -x "$SETUP_SCRIPT" ]; then
    echo "🔐 Fixing permission for setup.sh"
    chmod +x "$SETUP_SCRIPT" 2>/dev/null || sudo chmod +x "$SETUP_SCRIPT"
  fi

  echo "🔧 Running setup tasks..."
  $SETUP_SCRIPT
fi

# ────────────────────────────────────────────────────────────────
# VM Mode
# ────────────────────────────────────────────────────────────────
if [[ "$1" == "--vm-mode" || "$IS_VM" == "true" ]]; then
  echo ""
  echo "🚀 Running production Docker stack inside VM (local area network)..."

  export NODE_ENV=production
  export VM_MODE=true

  echo "📦 Sourcing .env files..."
  set -a
  [ -f "$ENV_DOCKER" ] && source "$ENV_DOCKER"
  [ -f "$ENV_BACKEND" ] && source "$ENV_BACKEND"
  [ -f "$ENV_FRONTEND" ] && source "$ENV_FRONTEND"
  set +a

  echo "🚀 Starting Docker Compose for VM/production..."
  docker compose -f "$LAN_COMPOSE_FILE" up --build
  exit 0
fi

# ────────────────────────────────────────────────────────────────
# Local Production Mode (non-VM)
# ────────────────────────────────────────────────────────────────
OS_NAME=$(uname -s)
IS_UBUNTU=false
if [ "$OS_NAME" == "Linux" ]; then
  DISTRO_ID=$(grep '^ID=' /etc/os-release | cut -d= -f2)
  if [ "$DISTRO_ID" == "ubuntu" ]; then
    IS_UBUNTU=true
  fi
fi

if [ "$IS_UBUNTU" == "true" ]; then
  echo "📦 Sourcing .env files..."
  set -a
  [ -f "$ENV_DOCKER" ] && source "$ENV_DOCKER"
  [ -f "$ENV_BACKEND" ] && source "$ENV_BACKEND"
  [ -f "$ENV_FRONTEND" ] && source "$ENV_FRONTEND"
  set +a

  echo "🚀 Running on Ubuntu. Proceeding with local production build..."
  docker compose -f "$LAN_COMPOSE_FILE" build --no-cache
  docker compose -f "$LAN_COMPOSE_FILE" up
else
  echo "🧠 Detected non-Ubuntu system ($OS_NAME). Running production build inside VM..."
  if [ "$IS_VM" != "true" ]; then
    $VIRTUAL_BRIDGE_SCRIPT
  fi
  $RUN_IN_VM_SCRIPT
fi
