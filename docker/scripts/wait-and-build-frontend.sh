#!/bin/sh
set -e

echo "[Homepage] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

# Source the resolved hostname file (sets RESOLVED_HOST)
. /avahi/resolved-hostname.env

# Export dynamic var for Next.js
export NEXT_PUBLIC_BACKEND_URL="${RESOLVED_HOST}/nestjs"
echo "[Homepage] NEXT_PUBLIC_BACKEND_URL resolved to: $NEXT_PUBLIC_BACKEND_URL"

echo "[Homepage] Building Next.js frontend (rebuild with updated env)..."
yarn build:docker

echo "[Homepage] Starting Next.js app..."
exec yarn start:localareanetwork:prod
