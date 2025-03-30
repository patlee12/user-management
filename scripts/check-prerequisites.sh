#!/bin/bash

set -e

echo "🔧 Checking prerequisites..."

# Check Node version
REQUIRED_NODE_VERSION="v22.13.1"
NODE_VERSION=$(node -v)
if [ "$NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
  echo "❌ You need Node.js $REQUIRED_NODE_VERSION. Current version is $NODE_VERSION."
  exit 1
fi
echo "✅ Node.js version is correct: $NODE_VERSION"

# Check Yarn version
REQUIRED_YARN_VERSION="1.22.22"
YARN_VERSION=$(yarn -v)
if [ "$YARN_VERSION" != "$REQUIRED_YARN_VERSION" ]; then
  echo "❌ You need Yarn $REQUIRED_YARN_VERSION. Current version is $YARN_VERSION."
  exit 1
fi
echo "✅ Yarn version is correct: $YARN_VERSION"

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

echo "All prerequisites are met! Proceeding with the development build."
