#!/bin/bash

set -e

VM_NAME="avahi-vm"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_ROOT/docker/.env"
MOUNT_NAME="$(basename "$REPO_ROOT")"
VM_REPO_PATH="/home/ubuntu/$MOUNT_NAME"
HEADLESS=false

# Read flags
for arg in "$@"; do
  if [[ "$arg" == "--headless" ]]; then
    HEADLESS=true
  fi
done

# Read AVAHI_HOSTNAME from docker/.env (default fallback)
if [ -f "$ENV_FILE" ]; then
  AVAHI_HOSTNAME=$(grep '^AVAHI_HOSTNAME=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"')
fi
AVAHI_HOSTNAME=${AVAHI_HOSTNAME:-user-management}
SERVICE_NAME="$AVAHI_HOSTNAME"
SERVICE_PORT=80

echo "▶ Checking for Multipass..."
if ! command -v multipass &>/dev/null; then
  echo "❌ Multipass is not installed."
  echo "👉 Download it here: https://multipass.run"
  exit 1
fi

# Boot the VM
if ! multipass info "$VM_NAME" &>/dev/null; then
  echo "▶ Launching Ubuntu VM '$VM_NAME'..."
  multipass launch --name "$VM_NAME" --mem 2G --disk 20G --cpus 2
else
  echo "✅ VM '$VM_NAME' already exists."
fi

# Mount the repo directory into the VM
echo "▶ Mounting local repo into the VM..."
multipass mount "$REPO_ROOT" "$VM_NAME:$VM_REPO_PATH" || echo "⚠️ Repo already mounted."

# Install dependencies inside the VM
echo "▶ Installing Docker & Avahi in VM..."
multipass exec "$VM_NAME" -- sudo apt update
multipass exec "$VM_NAME" -- sudo apt install -y docker.io avahi-daemon libnss-mdns curl
multipass exec "$VM_NAME" -- sudo usermod -aG docker ubuntu
multipass exec "$VM_NAME" -- sudo systemctl restart avahi-daemon

# Set Avahi hostname
echo "▶ Setting Avahi hostname to '$AVAHI_HOSTNAME'..."
multipass exec "$VM_NAME" -- sudo hostnamectl set-hostname "$AVAHI_HOSTNAME"
multipass exec "$VM_NAME" -- sudo sed -i "s/^#host-name=.*/host-name=$AVAHI_HOSTNAME/" /etc/avahi/avahi-daemon.conf
multipass exec "$VM_NAME" -- sudo sed -i "s/^host-name=.*/host-name=$AVAHI_HOSTNAME/" /etc/avahi/avahi-daemon.conf
multipass exec "$VM_NAME" -- sudo systemctl restart avahi-daemon

# Broadcast the service over mDNS
echo "▶ Broadcasting '$SERVICE_NAME.local:$SERVICE_PORT' via Avahi..."
SERVICE_FILE_CONTENT="<?xml version=\"1.0\" standalone='no'?>
<!DOCTYPE service-group SYSTEM \"avahi-service.dtd\">
<service-group>
  <name>$SERVICE_NAME</name>
  <service>
    <type>_http._tcp</type>
    <port>$SERVICE_PORT</port>
  </service>
</service-group>"
multipass exec "$VM_NAME" -- bash -c "echo '$SERVICE_FILE_CONTENT' | sudo tee /etc/avahi/services/$SERVICE_NAME.service > /dev/null"
multipass exec "$VM_NAME" -- sudo systemctl restart avahi-daemon

# Run the main build script inside the VM
echo "▶ Running production build script inside the VM..."
multipass exec "$VM_NAME" -- bash -c "cd $VM_REPO_PATH && ./run-local-build.sh --vm-mode"

# Check if .local resolves on host
echo ""
echo "🌐 Verifying if '$SERVICE_NAME.local' resolves..."
if ping -c 1 "$SERVICE_NAME.local" &>/dev/null; then
  echo "✅ $SERVICE_NAME.local resolved successfully!"
else
  echo "⚠️ Could not resolve '$SERVICE_NAME.local'. You can try:"
  VM_IP=$(multipass info "$VM_NAME" | grep IPv4 | awk '{print $2}')
  echo "  sudo echo '$VM_IP $SERVICE_NAME.local' >> /etc/hosts"
fi

# Open in browser unless headless
if [ "$HEADLESS" = false ]; then
  echo ""
  echo "🌐 Opening in browser..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://$SERVICE_NAME.local:$SERVICE_PORT"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "http://$SERVICE_NAME.local:$SERVICE_PORT"
  fi
fi

echo ""
echo "🎉 Done! Your app should be accessible at: http://$SERVICE_NAME.local:$SERVICE_PORT"
echo ""

# Optional teardown
read -rp "🧹 Do you want to stop the VM now? [y/N]: " TEARDOWN
if [[ "$TEARDOWN" =~ ^[Yy]$ ]]; then
  echo "🧨 Stopping VM '$VM_NAME'..."
  multipass stop "$VM_NAME"
  echo "✅ VM stopped."
else
  echo "💡 You can stop the VM later with: multipass stop $VM_NAME"
fi
