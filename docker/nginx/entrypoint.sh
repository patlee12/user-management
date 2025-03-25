#!/bin/sh

set -e

# Check that env is set
if [ -z "$AVAHI_HOSTNAME" ]; then
  echo "[nginx-entrypoint] ERROR: AVAHI_HOSTNAME is not set."
  exit 1
fi

echo "[nginx-entrypoint] Using AVAHI_HOSTNAME=$AVAHI_HOSTNAME"
echo "[nginx-entrypoint] Generating nginx.conf from template..."

envsubst '${AVAHI_HOSTNAME}' < /etc/nginx/nginx.localarea.conf.template > /etc/nginx/nginx.conf

echo "[nginx-entrypoint] Final server_name line:"
grep server_name /etc/nginx/nginx.conf

# Wait for homepage-app to be resolvable
echo "[nginx-entrypoint] Waiting for homepage-app to be resolvable..."
until getent hosts homepage-app; do
  sleep 1
done

echo "[nginx-entrypoint] homepage-app is resolvable. Starting Nginx..."

exec nginx -g 'daemon off;'
