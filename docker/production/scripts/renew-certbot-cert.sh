#!/usr/bin/env bash
set -euo pipefail

echo "🔁 Renewing any Let's Encrypt certificates..."

docker run --rm \
  -v "$(pwd)/docker/production/nginx/certs:/etc/letsencrypt" \
  -v "$(pwd)/docker/production/nginx/www:/var/www/html" \
  certbot/certbot renew --webroot -w /var/www/html

echo "✅ Renewal process complete."
