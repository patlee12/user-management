#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "✅ Verifying system setup and prompting for env/config..."
bash ./scripts/check-prerequisites.sh
yarn env:backend

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
