#!/bin/sh

set -e

# Load resolved hostname from Avahi if not already set
if [ -z "$AVAHI_HOSTNAME" ] && [ -f /avahi/resolved-hostname.env ]; then
  echo "[nginx-entrypoint] Loading AVAHI_HOSTNAME from /avahi/resolved-hostname.env..."
  . /avahi/resolved-hostname.env
fi

# Final validation
if [ -z "$AVAHI_HOSTNAME" ]; then
  echo "[nginx-entrypoint] ERROR: AVAHI_HOSTNAME is not set or resolvable."
  exit 1
fi

echo "[nginx-entrypoint] Using AVAHI_HOSTNAME=$AVAHI_HOSTNAME"
echo "[nginx-entrypoint] Generating nginx.conf from template..."

envsubst '${AVAHI_HOSTNAME}' < /etc/nginx/nginx.localarea.conf.template > /etc/nginx/nginx.conf

echo "[nginx-entrypoint] Final server_name line:"
grep server_name /etc/nginx/nginx.conf || true

# Wait for homepage-app to resolve in Docker DNS
echo "[nginx-entrypoint] Waiting for homepage-app to be resolvable..."
until getent hosts homepage-app > /dev/null 2>&1; do
  sleep 1
done

echo "[nginx-entrypoint] homepage-app is resolvable. Starting Nginx..."

exec nginx -g 'daemon off;'
