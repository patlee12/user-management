#!/usr/bin/env bash
set -euo pipefail

# Resolve to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

LIVE_CERTS_DIR="$ROOT_DIR/docker/production/nginx/certs/live"
ARCHIVE_CERTS_DIR="$ROOT_DIR/docker/production/nginx/certs/archive"

# Ensure traversal is possible
echo "🔧 Fixing permissions on cert folders..."
chmod 755 "$ROOT_DIR/docker" \
           "$ROOT_DIR/docker/production" \
           "$ROOT_DIR/docker/production/nginx" \
           "$ROOT_DIR/docker/production/nginx/certs" \
           "$LIVE_CERTS_DIR" || true

# Fix all certs under each domain folder
for domain_dir in "$LIVE_CERTS_DIR"/*; do
  [ -d "$domain_dir" ] || continue

  echo "🔍 Fixing certs in: $domain_dir"

  for file in fullchain.pem privkey.pem cert.pem chain.pem; do
    src="$domain_dir/$file"

    if [[ -L "$src" ]]; then
      if [[ ! -e "$src" ]]; then
        echo "⚠️  Broken symlink: $src (skipping)"
        continue
      fi

      real_path=$(readlink -f "$src")
      echo "🔁 Replacing symlink $file → $real_path"
      cp -fL "$src" "$src"
    fi

    if [[ -f "$src" ]]; then
      chmod 644 "$src" || true
      chown "$USER:docker" "$src" || true
    fi
  done

  chmod 755 "$domain_dir" || true
done

echo "✅ Manual certs fixed and readable."
