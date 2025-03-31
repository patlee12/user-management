#!/bin/sh

set -e

spinner='/-\|'
i=0
TIMEOUT=60

BACKEND_HOST="nestjs"
FRONTEND_HOST="homepage-app"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo ""
echo "📡 Service Watcher started inside container"
echo "🔍 Checking Docker services via TCP ports:"
echo "   - Backend:  ${BACKEND_HOST}:${BACKEND_PORT}"
echo "   - Frontend: ${FRONTEND_HOST}:${FRONTEND_PORT}"

# Spinner helper
next_spinner() {
  i=$((i + 1))
  printf "%s" "$(echo "$spinner" | cut -c $(((i % 4) + 1)))"
}

wait_for_port() {
  HOST=$1
  PORT=$2
  LABEL=$3

  printf "⌛ Waiting for %s at %s:%s " "$LABEL" "$HOST" "$PORT"
  START_TIME=$(date +%s)

  while ! nc -z "$HOST" "$PORT" 2>/dev/null; do
    printf "\r  %s Still waiting on %s at %s:%s " "$(next_spinner)" "$LABEL" "$HOST" "$PORT"
    sleep 0.5

    NOW=$(date +%s)
    if [ $((NOW - START_TIME)) -gt "$TIMEOUT" ]; then
      echo "\n❌ Timed out waiting for $LABEL at $HOST:$PORT"
      exit 1
    fi
  done

  echo ""
  echo "✅ $LABEL is live on $HOST:$PORT!"
}

wait_for_port "$BACKEND_HOST" "$BACKEND_PORT" "NestJS"
wait_for_port "$FRONTEND_HOST" "$FRONTEND_PORT" "Homepage"

echo ""
echo "🎉 All Docker services are reachable via TCP!"

# Linking block (for Avahi-based .local access)
if [ -f /avahi/resolved-hostname.env ]; then
  RESOLVED_HOST=$(grep '^RESOLVED_HOST=' /avahi/resolved-hostname.env | cut -d '=' -f2-)
  HOSTNAME="${RESOLVED_HOST#https://}"

  echo ""
  echo "========================================"
  echo "🔗 Linked Services via Avahi (LAN):"
  echo "🌐 Homepage Application:    ${RESOLVED_HOST}"
  echo "📘 Swagger API Docs:        ${RESOLVED_HOST}/nestjs/api"
  echo "🛠️  Admin Panel:             ${RESOLVED_HOST}/nestjs/admin"
  echo "🗃️  Adminer Database UI:     ${RESOLVED_HOST}/adminer"
  echo "========================================"
  echo ""
else
  echo ""
  echo "⚠️  No /avahi/resolved-hostname.env found — skipping Avahi .local links."
  echo ""
fi

