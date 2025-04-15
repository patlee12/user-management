#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBROOT_DIR="$(cd "$SCRIPT_DIR/../nginx/www" && pwd)"
CHALLENGE_DIR="${WEBROOT_DIR}/.well-known/acme-challenge"

echo "📁 [prepare-webroot] Preparing Certbot webroot structure..."
echo "📁 [prepare-webroot] Webroot base directory: ${WEBROOT_DIR}"
echo "📁 [prepare-webroot] Challenge directory:    ${CHALLENGE_DIR}"

mkdir -p "${CHALLENGE_DIR}"
echo "✅ [prepare-webroot] Created challenge directory."

# simple test files for manual curl checks
echo "✅ nginx is working!" > "${WEBROOT_DIR}/test-check.txt"
echo "🧪 [prepare-webroot] Wrote test file: ${WEBROOT_DIR}/test-check.txt"

echo "TEST_CHALLENGE_FILE_REACHABLE" > "${CHALLENGE_DIR}/test-challenge.txt"
echo "🧪 [prepare-webroot] Wrote challenge file: ${CHALLENGE_DIR}/test-challenge.txt"

echo "✅ [prepare-webroot] Webroot setup complete."
