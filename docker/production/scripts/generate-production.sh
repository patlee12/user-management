#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "🔄 [3.1/4] Generating .env files..."
"$SCRIPT_DIR/generate-env-production.sh"

echo ""
echo "🧱 [3.2/4] Building nginx.production.conf from template..."
"$SCRIPT_DIR/build-nginx-config.sh"

echo ""
echo "📁 [3.3/4] Creating Certbot webroot structure..."
"$SCRIPT_DIR/prepare-webroot.sh"

echo ""
echo "🔐 [3.4/4] Generating fallback self-signed certificate (if no live cert exists)..."
"$SCRIPT_DIR/generate-certs.sh"

echo ""
echo "✅ [3–6] Environment setup complete."
