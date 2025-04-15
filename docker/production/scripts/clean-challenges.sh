#!/usr/bin/env bash
set -euo pipefail

# ────────────────────────────────────────────────────────
# Resolve paths
# ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ACME_DIR="$ROOT_DIR/docker/production/nginx/www/.well-known/acme-challenge"

# ────────────────────────────────────────────────────────
# Cleanup
# ────────────────────────────────────────────────────────
if [[ -d "$ACME_DIR" ]]; then
  echo "🧹 Cleaning: $ACME_DIR"
  rm -rf "$ACME_DIR"/*
  echo "✅ Challenge files cleaned."
else
  echo "ℹ️  ACME challenge directory not found: $ACME_DIR"
fi
