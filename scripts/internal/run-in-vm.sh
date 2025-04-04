#!/bin/bash

# Force fresh VM + repo every time
set -e

VM_NAME="avahi-vm"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/docker/.env"
MOUNT_NAME="$(basename "$REPO_ROOT")"
VM_REPO_PATH="/home/ubuntu/$MOUNT_NAME"
TAR_PATH="/tmp/user-management.tar.gz"
HEADLESS=false

IS_GIT_BASH=false
case "$OSTYPE" in
  msys*|cygwin*) IS_GIT_BASH=true ;;
esac

vm_exec() {
  if [ "$IS_GIT_BASH" = true ]; then
    MSYS_NO_PATHCONV=1 multipass exec "$VM_NAME" -- "$@"
  else
    multipass exec "$VM_NAME" -- "$@"
  fi
}

for arg in "$@"; do
  if [[ "$arg" == "--headless" ]]; then
    HEADLESS=true
  fi
done

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

echo "🚨 Removing existing VM (if any)..."
multipass stop "$VM_NAME" 2>/dev/null || true
multipass delete "$VM_NAME" 2>/dev/null || true
multipass purge

echo "▶ Launching Ubuntu VM '$VM_NAME' with Hyper-V bridge networking..."
multipass launch --name "$VM_NAME" --mem 2G --disk 20G --cpus 2 --network name='Multipass Bridge'


if mountpoint -q "$VM_REPO_PATH"; then
  echo "🧹 Unmounting existing mount..."
  multipass unmount "$VM_NAME:$VM_REPO_PATH" || true
fi

echo "▶ Mounting local repo into the VM..."
if ! multipass mount "$REPO_ROOT" "$VM_NAME:$VM_REPO_PATH" 2>/dev/null; then
  echo "⚠️ Mount failed. Falling back to tarball transfer..."
  echo "📁 Creating tarball..."
  tar -czf "$TAR_PATH" \
    --exclude="$MOUNT_NAME/node_modules" \
    --exclude="$MOUNT_NAME/dist" \
    -C "$(dirname "$REPO_ROOT")" "$MOUNT_NAME"

  echo "📆 Copying tarball into VM..."
  if [ "$IS_GIT_BASH" = true ]; then
    HOST_TAR_PATH=$(cygpath -w "$TAR_PATH")
    MSYS_NO_PATHCONV=1 multipass copy-files "$HOST_TAR_PATH" "$VM_NAME:/home/ubuntu/user-management.tar.gz"
  else
    multipass copy-files "$TAR_PATH" "$VM_NAME:/home/ubuntu/user-management.tar.gz"
  fi

  echo "📆 Extracting tarball inside VM..."
  vm_exec bash -c "rm -rf '$VM_REPO_PATH' && mkdir -p /home/ubuntu && tar -xzf /home/ubuntu/user-management.tar.gz -C /home/ubuntu && rm /home/ubuntu/user-management.tar.gz"
  rm "$TAR_PATH"
else
  echo "✅ Repo mounted successfully."
  echo "🧼 Cleaning mounted repo (node_modules/, dist/, etc.)..."
  vm_exec bash -c "rm -rf '$VM_REPO_PATH/node_modules' '$VM_REPO_PATH/dist'"
fi

echo "▶ Installing Docker & Avahi in VM..."
vm_exec sudo apt-get update
vm_exec sudo apt-get install -y docker.io avahi-daemon libnss-mdns curl
vm_exec sudo usermod -aG docker ubuntu
vm_exec sudo systemctl restart avahi-daemon

COMPOSE_VERSION="v2.27.0"
PLUGIN_PATH="/home/ubuntu/.docker/cli-plugins"

echo "▶ Installing Docker Compose plugin ($COMPOSE_VERSION)..."
vm_exec bash -c "
  mkdir -p $PLUGIN_PATH &&
  curl -fsSL https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-linux-x86_64 -o $PLUGIN_PATH/docker-compose &&
  chmod +x $PLUGIN_PATH/docker-compose &&
  echo '✅ Docker Compose plugin installed successfully.'
"

echo "▶ Ensuring Compose plugin path is added to .bashrc in VM..."
vm_exec bash -c "
  grep -q 'cli-plugins' ~/.bashrc || echo 'export PATH=\$PATH:\$HOME/.docker/cli-plugins' >> ~/.bashrc
"

echo "▶ Verifying docker compose version..."
vm_exec docker compose version

echo "▶ Setting Avahi hostname to '$AVAHI_HOSTNAME'..."
vm_exec sudo hostnamectl set-hostname "$AVAHI_HOSTNAME"
vm_exec sudo sed -i "s/^#host-name=.*/host-name=$AVAHI_HOSTNAME/" /etc/avahi/avahi-daemon.conf
vm_exec sudo sed -i "s/^host-name=.*/host-name=$AVAHI_HOSTNAME/" /etc/avahi/avahi-daemon.conf
vm_exec sudo systemctl restart avahi-daemon

SERVICE_FILE_CONTENT="<?xml version=\"1.0\" standalone='no'?>
<!DOCTYPE service-group SYSTEM \"avahi-service.dtd\">
<service-group>
  <name>$SERVICE_NAME</name>
  <service>
    <type>_http._tcp</type>
    <port>$SERVICE_PORT</port>
  </service>
</service-group>"

vm_exec bash -c "echo '$SERVICE_FILE_CONTENT' | sudo tee /etc/avahi/services/$SERVICE_NAME.service > /dev/null"
vm_exec sudo systemctl restart avahi-daemon

echo "▶ Listing contents of $VM_REPO_PATH in VM:"
vm_exec ls -l "$VM_REPO_PATH"

echo "▶ Converting .env files to Unix format..."
vm_exec find "$VM_REPO_PATH" -type f -iname ".env*" -exec sed -i 's/\r$//' {} \;

echo "▶ Converting .sh files to Unix format..."
vm_exec find "$VM_REPO_PATH" -type f -iname "*.sh" -exec sed -i 's/\r$//' {} \;

EXEC_DIR="$VM_REPO_PATH"
echo "▶ Running production build script inside the VM..."
vm_exec bash -c "
  export PATH=\"\$HOME/.docker/cli-plugins:\$PATH\" &&
  chmod +x '$EXEC_DIR/run-local-build.sh' &&
  cd '$VM_REPO_PATH' &&
  '$EXEC_DIR/run-local-build.sh' --vm-mode
"

echo ""
echo "🌐 Verifying if '$SERVICE_NAME.local' resolves..."
if ping -c 1 "$SERVICE_NAME.local" &>/dev/null; then
  echo "✅ $SERVICE_NAME.local resolved successfully!"
else
  echo "⚠️ Could not resolve '$SERVICE_NAME.local'. Try manually adding it to /etc/hosts:"
  VM_IP=$(multipass info "$VM_NAME" | grep IPv4 | awk '{print $2}')
  echo "  sudo echo '$VM_IP $SERVICE_NAME.local' >> /etc/hosts"
fi

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

read -rp "🪩 Do you want to stop the VM now? [y/N]: " TEARDOWN
if [[ "$TEARDOWN" =~ ^[Yy]$ ]]; then
  echo "🚨 Stopping VM '$VM_NAME'..."
  multipass stop "$VM_NAME"
  echo "✅ VM stopped."
else
  echo "💡 You can stop the VM later with: multipass stop $VM_NAME"
fi
