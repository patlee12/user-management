#!/usr/bin/env bash
set -euo pipefail

# Get the directory where this script is located
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$BASE_DIR"

echo "🔐 Making all scripts in $SCRIPT_DIR executable..."
find "$SCRIPT_DIR" -type f -name "*.sh" -exec chmod +x {} \;

# Also chmod the main deploy script in the parent folder (../)
MAIN_SCRIPT="$BASE_DIR/../run-production-build.sh"
if [ -f "$MAIN_SCRIPT" ]; then
  echo "🔧 Ensuring run-production-build.sh is executable..."
  chmod +x "$MAIN_SCRIPT"
fi

echo "✅ Script permissions set."
