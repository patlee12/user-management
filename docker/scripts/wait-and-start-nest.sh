#!/bin/sh

echo "[NestJS] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

. /avahi/resolved-hostname.env

export FRONTEND_URL=$RESOLVED_HOST
echo "[NestJS] FRONTEND_URL resolved to: $RESOLVED_HOST"

# Run the backend normally — don't call docker compose inside Docker!
yarn workspace user-management-backend start:prod

echo ""
echo "========================================"
echo "🚀 Homepage Application (homepage-app): $RESOLVED_HOST"
echo "🚀 Swagger endpoint: ${RESOLVED_HOST}/nestjs/api"
echo "🚀 Admin Panel endpoint: ${RESOLVED_HOST}/nestjs/admin"
echo "🚀 Adminer endpoint: ${RESOLVED_HOST}/adminer"
echo "========================================"
echo ""

wait
