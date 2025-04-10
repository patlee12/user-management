#!/bin/sh

echo "[Homepage] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

# Source the resolved hostname file (sets RESOLVED_HOST)
. /avahi/resolved-hostname.env

# Export the dynamic variable for Next.js client usage
export NEXT_PUBLIC_BACKEND_URL="${RESOLVED_HOST}/nestjs"
echo "[Homepage] NEXT_PUBLIC_BACKEND_URL resolved to: $NEXT_PUBLIC_BACKEND_URL"

# Move into the homepage-app directory for local scripts and next build/start
cd apps/frontend/homepage-app || exit 1

echo "[Homepage] Building Next.js frontend (2nd build)..."
yarn build:docker

echo "[Homepage] Starting Next.js app..."
exec yarn start:localareanetwork:prod
