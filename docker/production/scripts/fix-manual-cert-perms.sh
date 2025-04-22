#!/usr/bin/env bash
set -euo pipefail

# Resolve to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

LIVE_CERTS_DIR="$ROOT_DIR/docker/production/nginx/certs/live"
ARCHIVE_CERTS_DIR="$ROOT_DIR/docker/production/nginx/certs/archive"

# Ensure traversal is possible
echo "🔧 Fixing permissions on cert folders..."
chmod +x \
  "$ROOT_DIR/docker" \
  "$ROOT_DIR/docker/production" \
  "$ROOT_DIR/docker/production/nginx" \
  "$ROOT_DIR/docker/production/nginx/certs" \
  "$LIVE_CERTS_DIR" || true

# Fix all certs under each domain folder
for domain_dir in "$LIVE_CERTS_DIR"/*; do
  [ -d "$domain_dir" ] || continue

  echo "🔍 Fixing certs in: $domain_dir"

  # Resolve and replace symlinks with actual files
  for file in fullchain.pem privkey.pem cert.pem chain.pem; do
    src="$domain_dir/$file"
    if [[ -L "$src" ]]; then
      real_path=$(readlink -f "$src")
      if [[ -f "$real_path" ]]; then
        echo "🔁 Replacing symlink $file → $real_path"
        cp "$real_path" "$src.copy"
        mv "$src.copy" "$src"
      fi
    fi
    chmod 644 "$src" 2>/dev/null || true
    chown "$USER:docker" "$src" 2>/dev/null || true
  done

  chmod 755 "$domain_dir" || true
done

echo "✅ Manual certs fixed and readable."
