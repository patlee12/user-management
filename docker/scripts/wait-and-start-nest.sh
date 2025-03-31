#!/bin/sh

echo "[NestJS] Waiting for resolved hostname..."
while [ ! -f /avahi/resolved-hostname.env ]; do
  sleep 2
done

. /avahi/resolved-hostname.env
export FRONTEND_URL=$RESOLVED_HOST
echo "[NestJS] FRONTEND_URL resolved to: $RESOLVED_HOST"

echo ""
echo "📦 Sourcing .env and .env.localareanetwork for NestJS..."

cd /src/app/apps/backend || {
  echo "❌ Failed to cd into /src/app/apps/backend"
  exit 1
}

# echo ""
# echo "📁 Now inside: $(pwd)"
# echo "📂 Directory contents:"
# ls -alh

echo ""
echo "🧬 Running Prisma Migrate Deploy..."
yarn prisma migrate deploy

echo ""
echo "🌱 Running run-admin-seed.ts..."
yarn seed:admin


echo ""
echo "🚀 Starting Backend..."
yarn start:prod
