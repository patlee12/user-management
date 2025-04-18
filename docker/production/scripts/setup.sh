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

# Create log directories if they don't exist
ENV_LOG_DIR="$BASE_DIR/../env-logs"
NGINX_LOG_DIR="$BASE_DIR/../nginx/logs"

echo "🗂️  Ensuring log directories exist..."
mkdir -p "$ENV_LOG_DIR"
mkdir -p "$NGINX_LOG_DIR"

# Set proper permissions
echo "🔧 Setting permissions for log directories..."
if [ "$(id -u)" -eq 0 ]; then
  chmod -R 755 "$ENV_LOG_DIR"
  chmod -R 755 "$NGINX_LOG_DIR"
  echo "✅ Permissions successfully updated (root)."
else
  # Use sudo to ensure directory is writable if owned by root
  echo "⚠️ You are not root — attempting to set ownership with sudo..."
  sudo chown -R "$USER:$USER" "$NGINX_LOG_DIR"
  sudo chmod -R 755 "$NGINX_LOG_DIR"
  echo "✅ Ownership and permissions set for $NGINX_LOG_DIR"
fi

echo "✅ Script permissions and log directories set."
