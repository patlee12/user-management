#!/bin/bash

set -e

echo "🔧 Checking prerequisites..."

# Required version ranges
MIN_NODE_VERSION="22"
MAX_NODE_VERSION="23"
MIN_YARN_VERSION="1.22.0"

# Check Node.js version (major only)
NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt "$MIN_NODE_VERSION" ] || [ "$NODE_MAJOR" -ge "$MAX_NODE_VERSION" ]; then
  echo "❌ Node.js version must be >= $MIN_NODE_VERSION and < $MAX_NODE_VERSION. Current: $NODE_VERSION"
  exit 1
fi
echo "✅ Node.js version is acceptable: v$NODE_VERSION"

# Check Yarn version (>= 1.22.0, < 2)
YARN_VERSION=$(yarn -v)
YARN_MAJOR=$(echo "$YARN_VERSION" | cut -d. -f1)
if [ "$YARN_MAJOR" -ge 2 ]; then
  echo "❌ Yarn version must be < 2. Current: $YARN_VERSION"
  exit 1
fi
echo "✅ Yarn version is acceptable: $YARN_VERSION"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker to proceed."
  exit 1
fi
echo "✅ Docker is installed."

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi
echo "✅ Docker is running."

echo "✅ All prerequisites are met!"
