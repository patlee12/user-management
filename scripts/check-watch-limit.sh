#!/bin/bash

set -e

REQUIRED=524288
PLATFORM=$(uname | tr '[:upper:]' '[:lower:]')

if [[ "$PLATFORM" == "linux" ]]; then
  FILE="/proc/sys/fs/inotify/max_user_watches"

  if [[ ! -f "$FILE" ]]; then
    echo "⚠️  Cannot find inotify limit file. Skipping check."
    exit 0
  fi

  CURRENT=$(cat "$FILE")

  if (( CURRENT >= REQUIRED )); then
    echo "✅ [inotify] Watch limit is OK ($CURRENT)"
    exit 0
  fi

  echo ""
  echo "🚨 [inotify] Your system watch limit is too low: $CURRENT"
  echo "🛠 Required: $REQUIRED"
  echo ""
  read -p "❓ Do you want to automatically fix it now? (requires sudo) [y/N]: " REPLY

  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    echo "🔧 Applying fix with sudo..."
    echo "fs.inotify.max_user_watches=$REQUIRED" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p

    echo -e "\n✅ Watch limit updated!"
    echo "♻️  Restarting dev process..."
    exec yarn dev
  else
    echo -e "\n⚠️ Skipping fix. You may encounter build issues."
    echo "🔧 Run the following manually later:"
    echo ""
    echo "    echo fs.inotify.max_user_watches=$REQUIRED | sudo tee -a /etc/sysctl.conf"
    echo "    sudo sysctl -p"
    echo ""
  fi

elif [[ "$PLATFORM" == "darwin" ]]; then
  echo "✅ [macOS] No inotify watch limit issues expected."

elif [[ "$PLATFORM" == "mingw"* || "$PLATFORM" == "msys"* || "$PLATFORM" == "cygwin"* ]]; then
  echo "✅ [Windows] inotify limits do not apply."

else
  echo "⚠️  Unknown platform: $PLATFORM. Skipping inotify check."
fi
