#!/bin/sh
set -e

echo "⏳ Waiting for dependent services to become healthy..."

# Configurable targets and retries
SERVICES=("homepage-app:3000" "nestjs:3001")
MAX_RETRIES=30
RETRY_DELAY=2

# Wait function
wait_for_service() {
  service=$1
  attempt=1
  while [ $attempt -le $MAX_RETRIES ]; do
    if wget --spider -q "http://$service/healthz"; then
      echo "✅ $service is healthy!"
      return 0
    else
      echo "🔁 Waiting for $service (attempt $attempt/$MAX_RETRIES)..."
      sleep $RETRY_DELAY
      attempt=$((attempt + 1))
    fi
  done
  echo "❌ $service did not become healthy in time. Exiting."
  exit 1
}

# Wait on each target
for svc in "${SERVICES[@]}"; do
  wait_for_service "$svc"
done

echo "🚀 All services healthy. Starting Nginx..."
exec nginx -g 'daemon off;'
