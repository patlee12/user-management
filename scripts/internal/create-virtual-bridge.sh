#!/bin/bash
set -e

echo "🌉 Setting up virtual network bridge..."

OS_TYPE="$(uname)"
VM_NAME="avahi-vm"

case "$OS_TYPE" in
  "Linux")
    echo "🟢 Detected Linux system."
    if ! command -v ip &> /dev/null; then
      echo "❌ 'ip' command not found. Please install 'iproute2'."
      exit 1
    fi
    if ! ip link show br0 &>/dev/null; then
      echo "🔧 Creating bridge interface 'br0'..."
      sudo ip link add name br0 type bridge
      sudo ip addr add 192.168.100.1/24 dev br0
      sudo ip link set dev br0 up
    else
      echo "✅ Bridge 'br0' already exists."
    fi
    ;;
  
  "Darwin")
    echo "🍎 Detected macOS system."
    echo "⚠️ macOS does not support custom virtual bridges like Linux natively."
    echo "🧩 Consider using Multipass with the \`bridge\` network mode or Internet Sharing:"
    echo "   - Enable 'Internet Sharing' in System Preferences from your network to 'en0' or 'bridge0'."
    echo "   - Use 'pfctl' to forward ports if needed."
    echo "🔍 Checking existing interfaces:"
    ifconfig | grep -E "bridge[0-9]"
    ;;
  
  "MINGW"*|"MSYS"*|"CYGWIN"*)
    echo "🪟 Detected Windows (Git Bash)."
    echo "🔄 Windows doesn't support bash-created bridges. You must use Hyper-V to create a virtual switch."
    echo ""
    echo "⚙️ Instructions:"
    echo "   1. Open 'Hyper-V Manager'."
    echo "   2. Go to 'Virtual Switch Manager'."
    echo "   3. Create a new External virtual switch named 'Multipass Bridge' using your main network adapter."
    echo "   4. This switch will be used automatically when running your 'run-in-vm.sh' script."
    echo ""
    read -rp "📘 Press Enter once you've created the virtual switch 'Multipass Bridge'..."
    
    # Check if Git Bash is running as Administrator.
    if ! net session > /dev/null 2>&1; then
      echo "❌ Git Bash is not running as Administrator."
      echo "Attempting to relaunch elevated..."
      CURRENT_DIR="$(pwd)"
      # Compute absolute path to this script
      SCRIPT_PATH="$(cygpath -u "$0")"
      # Build command string using the absolute path
      cmd="\"${SCRIPT_PATH}\"; read -p \"Press Enter to exit...\""
      echo "Elevated command: $cmd"
      powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process 'C:\Program Files\Git\bin\bash.exe' -ArgumentList '--login -i -c \"$cmd\"' -Verb RunAs -Wait"
      exit 0
    fi
    
    # Now check for the virtual switch using PowerShell.
    if ! powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if ((Get-VMSwitch).Name -contains 'Multipass Bridge') { exit 0 } else { exit 1 }"; then
      echo "❌ 'Multipass Bridge' virtual switch not found. Please verify it was created in Hyper-V Manager."
      exit 1
    else
      echo "✅ 'Multipass Bridge' virtual switch detected."
    fi
    ;;
  
  *)
    echo "❓ Unknown OS: $OS_TYPE"
    exit 1
    ;;
esac

echo "✅ Bridge setup script finished."
