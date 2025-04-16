#!/bin/bash
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_ENV_FILE="$ROOT_DIR/apps/backend/.env"
GENERATE_SCRIPT="$SCRIPT_DIR/generate-env-files.sh"

# ───── Ensure all local scripts are executable ─────
echo "🔑 Ensuring all scripts in $SCRIPT_DIR are executable..."
chmod +x "$SCRIPT_DIR"/*.sh
echo "✅ Script permissions verified."

echo "🔧 Checking prerequisites..."

# ───── Version Checks ─────
MIN_NODE_VERSION="22"
MAX_NODE_VERSION="23"

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt "$MIN_NODE_VERSION" ] || [ "$NODE_MAJOR" -ge "$MAX_NODE_VERSION" ]; then
  echo "❌ Node.js version must be >= $MIN_NODE_VERSION and < $MAX_NODE_VERSION. Current: $NODE_VERSION"
  exit 1
fi
echo "✅ Node.js version is acceptable: v$NODE_VERSION"

YARN_VERSION=$(yarn -v)
YARN_MAJOR=$(echo "$YARN_VERSION" | cut -d. -f1)
if [ "$YARN_MAJOR" -ge 2 ]; then
  echo "❌ Yarn version must be < 2. Current: $YARN_VERSION"
  exit 1
fi
echo "✅ Yarn version is acceptable: $YARN_VERSION"

if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed."
  exit 1
fi
echo "✅ Docker is installed."

if ! docker info &> /dev/null; then
  echo "❌ Docker is not running."
  exit 1
fi
echo "✅ Docker is running."

# ───── .env Checks ─────
REQUIRED_ENV_FILES=(
  "$ROOT_DIR/docker/.env"
  "$ROOT_DIR/apps/backend/.env"
  "$ROOT_DIR/apps/frontend/homepage-app/.env"
)

echo "🧪 Checking required .env files..."
missing_env=0
for env_file in "${REQUIRED_ENV_FILES[@]}"; do
  if [[ ! -f "$env_file" ]]; then
    echo "❌ Missing: $env_file"
    ((missing_env++))
  else
    echo "✅ Found: $env_file"
  fi
done

if [[ ! -f "$GENERATE_SCRIPT" ]]; then
  echo "❌ Script not found: $GENERATE_SCRIPT"
  exit 1
fi

# ───── Detect if any NODE_ENV is set to production ─────
echo ""
echo "🔎 Checking for NODE_ENV=production in env files..."
production_detected=false

for env_file in "${REQUIRED_ENV_FILES[@]}"; do
  if [[ -f "$env_file" ]]; then
    node_env_val=$(grep -i "^NODE_ENV=" "$env_file" | cut -d= -f2 | tr -d '"')
    if [[ "${node_env_val,,}" == "production" ]]; then
      echo "⚠️  NODE_ENV=production found in: $env_file"
      production_detected=true
    fi
  fi
done

if [[ "$production_detected" == true ]]; then
  echo ""
  echo "🚨 One or more .env files are set to NODE_ENV=production!"
  echo "🧼 It's recommended to reset environment files for development."

  read -rp "Would you like to regenerate .env files now? (y/N): " fix_env
  if [[ "$fix_env" =~ ^[yY]$ ]]; then
    echo "▶️  Running: $GENERATE_SCRIPT"
    bash "$GENERATE_SCRIPT"
    echo "✅ .env files regenerated."
  else
    echo "⚠️  Skipping regeneration. Be careful running production config in development mode."
  fi

  echo ""
  read -rp "🧹 Do you also want to reset the dev Postgres database volume 'dev_postgres_data'? This will DELETE ALL DATA. (y/N): " reset_pg_on_prod
  if [[ "$reset_pg_on_prod" =~ ^[yY]$ ]]; then
    echo "🛑 Stopping containers and removing volume..."
    docker compose -f "$ROOT_DIR/docker/docker-compose-development.yml" down -v
    echo "✅ Volume 'dev_postgres_data' has been reset."
  else
    echo "↩️  Skipping Postgres volume reset."
  fi
fi

# ───── If no production, continue with existing logic ─────
if [[ $missing_env -gt 0 ]]; then
  echo ""
  echo "⚠️  One or more .env files are missing."
  read -rp "➡️  Would you like to generate them now? (y/N): " choice
  if [[ "$choice" =~ ^[yY]$ ]]; then
    echo "▶️  Running: $GENERATE_SCRIPT"
    bash "$GENERATE_SCRIPT"
    echo "✅ Finished generating .env files."
  else
    echo "❌ Skipped generation. Cannot continue without env files."
    exit 1
  fi
else
  echo ""
  read -rp "🔁 All .env files exist. Would you like to regenerate them anyway? (y/N): " reset_env
  if [[ "$reset_env" =~ ^[yY]$ ]]; then
    echo "▶️  Running: $GENERATE_SCRIPT"
    bash "$GENERATE_SCRIPT"
    echo "✅ .env files regenerated."
  else
    echo "✅ Keeping existing .env files."
  fi
fi

# ───── Optional Postgres Volume Reset ─────
echo ""
read -rp "🧹 Do you want to reset the dev Postgres database volume 'dev_postgres_data'? This will DELETE ALL DATA. (y/N): " reset_pg
if [[ "$reset_pg" =~ ^[yY]$ ]]; then
  echo "🛑 Stopping containers and removing volume..."
  docker compose -f "$ROOT_DIR/docker/docker-compose-development.yml" down -v
  echo "✅ Volume 'dev_postgres_data' has been reset."
else
  echo "↩️  Skipping Postgres volume reset."
fi

# ───── Optional Email Service Setup ─────
echo ""
echo "📧 Email service is required to support account creation, verification, and recovery flows."

# Show current values if available
if [[ -f "$BACKEND_ENV_FILE" ]]; then
  current_provider=$(grep -E '^MAIL_SERVICE_PROVIDER=' "$BACKEND_ENV_FILE" | cut -d= -f2-)
  current_user=$(grep -E '^EMAIL_USER=' "$BACKEND_ENV_FILE" | cut -d= -f2-)
  current_pass=$(grep -E '^EMAIL_PASS=' "$BACKEND_ENV_FILE" | cut -d= -f2-)

  masked_pass=""
  if [[ -n "$current_pass" ]]; then
    masked_pass=$(echo "$current_pass" | sed 's/./*/g')
  fi

  echo "📨 Current MAIL_SERVICE_PROVIDER: ${current_provider:-<not set>}"
  echo "👤 Current EMAIL_USER:            ${current_user:-<not set>}"
  echo "🔑 Current EMAIL_PASS:            ${masked_pass:-<not set>}"
else
  echo "⚠️  Cannot display current values — backend .env file not found."
fi

read -rp "Do you want to (re)configure email service credentials now? (y/N): " setup_email
if [[ "$setup_email" =~ ^[yY]$ ]]; then
  echo ""
  echo "ℹ️  If you're using Google SMTP, use an App Password or API Key (not your actual password)."

  read -rp "MAIL_SERVICE_PROVIDER (e.g., smtp.gmail.com): " mail_provider
  read -rp "EMAIL_USER (e.g., noreply@yourdomain.com): " email_user
  read -rsp "EMAIL_PASS (App Password or API Key): " email_pass
  echo ""

  if [[ -f "$BACKEND_ENV_FILE" ]]; then
    sed -i '' -e "/^MAIL_SERVICE_PROVIDER=/d" "$BACKEND_ENV_FILE"
    sed -i '' -e "/^EMAIL_USER=/d" "$BACKEND_ENV_FILE"
    sed -i '' -e "/^EMAIL_PASS=/d" "$BACKEND_ENV_FILE"

    {
      echo ""
      echo "# Email service account and password"
      echo "MAIL_SERVICE_PROVIDER=\"$mail_provider\""
      echo "EMAIL_USER=\"$email_user\""
      echo "EMAIL_PASS=\"$email_pass\""
    } >> "$BACKEND_ENV_FILE"

    echo "✅ Email service variables updated in apps/backend/.env"
  else
    echo "❌ Could not find backend .env file to update email service."
  fi
else
  echo "⚠️  Skipping email service setup. Account-related email flows may not work."
fi

exit 0
