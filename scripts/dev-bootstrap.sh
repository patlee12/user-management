#!/bin/bash
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_PATH="$ROOT_DIR/apps/backend/dist/certs/localhost.pem"
FRONTEND_URL="https://localhost:3000"
BACKEND_URL="https://localhost:3001/api"

MAX_WAIT=20
WAIT_TIME=0

echo "[bootstrap] 📦 Dev bootstrap started"
echo "[bootstrap] 🔍 Waiting for self-signed certs to appear at: $CERT_PATH"

while [ ! -f "$CERT_PATH" ] && [ "$WAIT_TIME" -lt "$MAX_WAIT" ]; do
  sleep 1
  WAIT_TIME=$((WAIT_TIME + 1))
done

if [ ! -f "$CERT_PATH" ]; then
  echo "[bootstrap] ❌ Certs not found after $MAX_WAIT seconds. Skipping browser open."
  exit 0
fi

echo "[bootstrap] ✅ Cert found: $CERT_PATH"
echo "[bootstrap] 🔃 Waiting for Next.js server at $FRONTEND_URL to respond with HTTP 200..."

until curl -sk --head "$FRONTEND_URL" | grep "200 OK" > /dev/null; do
  sleep 1
done

echo "[bootstrap] ✅ Next.js server is live."
echo "[bootstrap] ⏳ Delaying browser launch by 5 seconds..."
sleep 5

echo "[bootstrap] 🌐 Opening browser windows:"
echo "   → $FRONTEND_URL"
echo "   → $BACKEND_URL"

if command -v xdg-open &> /dev/null; then
  xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &
  xdg-open "$BACKEND_URL" >/dev/null 2>&1 &
elif command -v open &> /dev/null; then
  open "$FRONTEND_URL" >/dev/null 2>&1 &
  open "$BACKEND_URL" >/dev/null 2>&1 &
else
  echo "[bootstrap] ⚠️ Could not detect a system browser opener; please open manually:"
  echo "   - $FRONTEND_URL"
  echo "   - $BACKEND_URL"
fi

echo "[bootstrap] ✅ Dev bootstrap completed. Exiting..."
exit 0
