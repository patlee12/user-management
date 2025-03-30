#!/bin/bash

set -e

echo ""
echo "🔧 Updating email service environment variables in .env file..."

# Define the path to your backend's .env file
ENV_FILE="./apps/backend/.env"

# Check if the .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at $ENV_FILE. Please ensure the backend .env file exists."
  exit 1
fi

# Inform the user that they can leave fields blank if they don't have values
echo "⚠️ If you don't have these values, you can leave them blank."

# Read the user's input for the email service environment variables
read -p "Enter your mail service provider (e.g., smtp.example.com) [Leave blank if none]: " MAIL_SERVICE_PROVIDER
read -p "Enter your email user (e.g., user@example.com) [Leave blank if none]: " EMAIL_USER
read -p "Enter your email password [Leave blank if none]: " EMAIL_PASS

# Update the .env file with the provided values
echo ""
echo "🔧 Updating .env file with email service credentials..."

# Use `sed` to update or add the required variables in the .env file
# If the variable exists, it will be updated. If not, it will be added.

if [ -n "$MAIL_SERVICE_PROVIDER" ]; then
  sed -i "s/^MAIL_SERVICE_PROVIDER=.*/MAIL_SERVICE_PROVIDER=\"$MAIL_SERVICE_PROVIDER\"/" "$ENV_FILE" || echo "MAIL_SERVICE_PROVIDER=\"$MAIL_SERVICE_PROVIDER\"" >> "$ENV_FILE"
fi

if [ -n "$EMAIL_USER" ]; then
  sed -i "s/^EMAIL_USER=.*/EMAIL_USER=\"$EMAIL_USER\"/" "$ENV_FILE" || echo "EMAIL_USER=\"$EMAIL_USER\"" >> "$ENV_FILE"
fi

if [ -n "$EMAIL_PASS" ]; then
  sed -i "s/^EMAIL_PASS=.*/EMAIL_PASS=\"$EMAIL_PASS\"/" "$ENV_FILE" || echo "EMAIL_PASS=\"$EMAIL_PASS\"" >> "$ENV_FILE"
fi

echo "✅ .env file updated successfully with email service credentials."

# Provide a summary of the updated environment variables
echo ""
echo "Updated Email Service Credentials in .env file:"
if [ -n "$MAIL_SERVICE_PROVIDER" ]; then
  echo "MAIL_SERVICE_PROVIDER=$MAIL_SERVICE_PROVIDER"
fi

if [ -n "$EMAIL_USER" ]; then
  echo "EMAIL_USER=$EMAIL_USER"
fi

if [ -n "$EMAIL_PASS" ]; then
  echo "EMAIL_PASS=***"  # Hiding password for security
fi
