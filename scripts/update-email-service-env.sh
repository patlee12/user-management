#!/bin/bash

set -e

echo ""
echo "🔧 Updating email service environment variables in .env file..."

ENV_FILE="./apps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at $ENV_FILE. Please ensure the backend .env file exists."
  exit 1
fi

# Load existing values
CURRENT_MAIL_SERVICE_PROVIDER=$(grep "^MAIL_SERVICE_PROVIDER=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')
CURRENT_EMAIL_USER=$(grep "^EMAIL_USER=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')
CURRENT_EMAIL_PASS=$(grep "^EMAIL_PASS=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

# Warn if values already exist
if [[ -n "$CURRENT_MAIL_SERVICE_PROVIDER" || -n "$CURRENT_EMAIL_USER" || -n "$CURRENT_EMAIL_PASS" ]]; then
  echo "⚠️ We detected existing email service credentials in your .env file:"
  echo "  MAIL_SERVICE_PROVIDER=${CURRENT_MAIL_SERVICE_PROVIDER:-<empty>}"
  echo "  EMAIL_USER=${CURRENT_EMAIL_USER:-<empty>}"
  echo "  EMAIL_PASS=${CURRENT_EMAIL_PASS:+***}"

  read -p "🔁 Do you want to update these values? (y/N): " CONFIRM_UPDATE
  if [[ ! "$CONFIRM_UPDATE" =~ ^[Yy]$ ]]; then
    echo "🚫 Aborting update. No changes made."
    exit 0
  fi
fi

# Prompt until all values are provided
while [[ -z "$MAIL_SERVICE_PROVIDER" ]]; do
  read -p "Enter your mail service provider (e.g., smtp.example.com): " MAIL_SERVICE_PROVIDER
done

while [[ -z "$EMAIL_USER" ]]; do
  read -p "Enter your email user (e.g., user@example.com): " EMAIL_USER
done

while [[ -z "$EMAIL_PASS" ]]; do
  read -s -p "Enter your email password: " EMAIL_PASS
  echo
done

echo ""
echo "🔧 Updating .env file with new email service credentials..."

# Cross-platform helper to update or insert key-value pairs in .env
update_env_var() {
  VAR_NAME=$1
  VAR_VALUE=$2

  if grep -q "^$VAR_NAME=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s|^$VAR_NAME=.*|$VAR_NAME=\"$VAR_VALUE\"|" "$ENV_FILE"
    else
      # Linux / Docker
      sed -i "s|^$VAR_NAME=.*|$VAR_NAME=\"$VAR_VALUE\"|" "$ENV_FILE"
    fi
  else
    echo "$VAR_NAME=\"$VAR_VALUE\"" >> "$ENV_FILE"
  fi
}

# Apply updates
update_env_var "MAIL_SERVICE_PROVIDER" "$MAIL_SERVICE_PROVIDER"
update_env_var "EMAIL_USER" "$EMAIL_USER"
update_env_var "EMAIL_PASS" "$EMAIL_PASS"

echo "✅ .env file updated successfully with email service credentials."

# Summary
echo ""
echo "Updated Email Service Credentials in .env file:"
echo "MAIL_SERVICE_PROVIDER=$MAIL_SERVICE_PROVIDER"
echo "EMAIL_USER=$EMAIL_USER"
echo "EMAIL_PASS=***"
