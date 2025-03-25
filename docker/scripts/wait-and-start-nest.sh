#!/bin/sh

echo "[NestJS] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

. /avahi/resolved-hostname.env

export FRONT_END_URL=$RESOLVED_HOST
echo "[NestJS] FRONT_END_URL resolved to: $RESOLVED_HOST"

# Start the NestJS application in the background.
yarn localareanetwork:prod &

# Wait for a while to allow the app to load.
sleep 8

echo ""
echo "========================================"
echo "🚀 Homepage Application (homepage-app): $RESOLVED_HOST"
echo "🚀 Swagger endpoint: ${RESOLVED_HOST}/nestjs/api"
echo "🚀 Admin Panel endpoint: ${RESOLVED_HOST}/nestjs/admin"
echo "🚀 Adminer endpoint: ${RESOLVED_HOST}/adminer"
echo "========================================"
echo ""

# Wait for the NestJS process to exit (keeps container running)
wait
