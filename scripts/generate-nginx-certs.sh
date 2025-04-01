#!/bin/bash

set -e

CERT_DIR="$(cd "$(dirname "$0")/../docker/nginx/certs" && pwd)"
KEY_PATH="$CERT_DIR/nginx-selfsigned.key"
CERT_PATH="$CERT_DIR/nginx-selfsigned.crt"

mkdir -p "$CERT_DIR"

if [[ -f "$CERT_PATH" && -f "$KEY_PATH" ]]; then
  echo "🔒 Nginx certs already exist. Skipping generation."
  exit 0
fi

echo "🔧 Generating self-signed certs for Nginx at: $CERT_DIR"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$KEY_PATH" \
  -out "$CERT_PATH" \
  -subj "//CN=localhost"

echo "✅ Self-signed certs generated."
