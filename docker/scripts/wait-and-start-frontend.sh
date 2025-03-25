#!/bin/sh

echo "[Homepage] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

. /avahi/resolved-hostname.env

# Append /nestjs to the resolved host
export BACKEND_URL="${RESOLVED_HOST}/nestjs"
echo "[Homepage] BACKEND_URL resolved to: $BACKEND_URL"

exec yarn start
