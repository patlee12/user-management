#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "✅ Verifying system setup and prompting for env/config..."
bash ./scripts/check-prerequisites.sh
yarn env:backend

echo ""
echo "🧼 Optionally clearing dev containers..."
read -p "❓ Do you want to remove existing dev containers? (y/n): " CONFIRM_CLEAR
if [[ "$CONFIRM_CLEAR" =~ ^[Yy]$ ]]; then
  bash ./scripts/clear-dev-containers.sh
fi

echo ""
echo "🐳 Starting Docker dev containers..."
yarn dev:docker

echo ""
echo "🚀 Starting development environment..."
yarn concurrently \
  --success first \
  --kill-others-on-fail \
  --names backend,frontend,bootstrap \
  --prefix-colors green,blue,gray \
  "yarn dev:backend" \
  "yarn dev:frontend" \
  "bash ./scripts/dev-bootstrap.sh"
