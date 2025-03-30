#!/bin/sh

echo "[Homepage] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

# Source the resolved hostname file (sets RESOLVED_HOST)
. /avahi/resolved-hostname.env

# Export the full backend URL (used by Next.js at runtime)
export NEXT_PUBLIC_BACKEND_URL="${RESOLVED_HOST}/nestjs"
echo "[Homepage] NEXT_PUBLIC_BACKEND_URL resolved to: $NEXT_PUBLIC_BACKEND_URL"

# Start Next.js server
exec yarn start
