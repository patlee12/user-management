#!/bin/bash
set +e

echo "🔧 Checking prerequisites..."

# ───── Version Checks ─────
MIN_NODE_VERSION="22"
MAX_NODE_VERSION="23"

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt "$MIN_NODE_VERSION" ] || [ "$NODE_MAJOR" -ge "$MAX_NODE_VERSION" ]; then
  echo "❌ Node.js version must be >= $MIN_NODE_VERSION and < $MAX_NODE_VERSION. Current: $NODE_VERSION"
  exit 1
fi
echo "✅ Node.js version is acceptable: v$NODE_VERSION"

YARN_VERSION=$(yarn -v)
YARN_MAJOR=$(echo "$YARN_VERSION" | cut -d. -f1)
if [ "$YARN_MAJOR" -ge 2 ]; then
  echo "❌ Yarn version must be < 2. Current: $YARN_VERSION"
  exit 1
fi
echo "✅ Yarn version is acceptable: $YARN_VERSION"

if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed."
  exit 1
fi
echo "✅ Docker is installed."

if ! docker info &> /dev/null; then
  echo "❌ Docker is not running."
  exit 1
fi
echo "✅ Docker is running."

# ───── .env Checks ─────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

REQUIRED_ENV_FILES=(
  "$ROOT_DIR/docker/.env"
  "$ROOT_DIR/apps/backend/.env"
  "$ROOT_DIR/apps/frontend/homepage-app/.env"
)

echo "🧪 Checking required .env files..."
missing_env=0
for env_file in "${REQUIRED_ENV_FILES[@]}"; do
  if [[ ! -f "$env_file" ]]; then
    echo "❌ Missing: $env_file"
    ((missing_env++))
  else
    echo "✅ Found: $env_file"
  fi
done

if [[ $missing_env -gt 0 ]]; then
  echo ""
  echo "⚠️  One or more .env files are missing."
  read -rp "➡️  Would you like to generate them now? (y/N): " choice
  if [[ "$choice" =~ ^[yY]$ ]]; then
    GENERATE_SCRIPT="$SCRIPT_DIR/generate-env-files.sh"
    if [[ -f "$GENERATE_SCRIPT" ]]; then
      echo "▶️  Running: $GENERATE_SCRIPT"
      bash "$GENERATE_SCRIPT"
      echo "✅ Finished generating .env files."
    else
      echo "❌ Script not found: $GENERATE_SCRIPT"
      exit 1
    fi
  else
    echo "❌ Skipped generation. Cannot continue without env files."
    exit 1
  fi
else
  echo "✅ All .env files are present."
fi

exit 0
