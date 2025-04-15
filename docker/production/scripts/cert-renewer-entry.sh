#!/usr/bin/env bash
set -euo pipefail

echo "📬 Starting cert-renewer-entry.sh..."

# Load environment variables
. /etc/env.production

# Lowercase provider
PROVIDER=$(echo "$MAIL_SERVICE_PROVIDER" | tr '[:upper:]' '[:lower:]')

# Default SMTP values (fallback for custom)
SMTP_HOST=""
SMTP_PORT="587"

case "$PROVIDER" in
  gmail)
    SMTP_HOST="smtp.gmail.com"
    ;;
  outlook)
    SMTP_HOST="smtp.office365.com"
    ;;
  zoho)
    SMTP_HOST="smtp.zoho.com"
    ;;
  *)
    echo "⚠️  Unsupported MAIL_SERVICE_PROVIDER: $MAIL_SERVICE_PROVIDER"
    echo "Using fallback SMTP host: $PROVIDER"
    SMTP_HOST="$PROVIDER"
    ;;
esac

# Create msmtprc config
cat > /etc/msmtprc <<EOF
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account        default
host           $SMTP_HOST
port           $SMTP_PORT
from           $EMAIL_USER
user           $EMAIL_USER
password       $EMAIL_PASS
account default : default
EOF

chmod 600 /etc/msmtprc

# Certbot auto-renew + email
while true; do
  echo "🔁 Checking cert renewals at $(date)..."

  certbot renew --webroot -w /var/www/html \
    --deploy-hook "echo '✅ Certificate for $DOMAIN_HOST renewed on $(date)' | msmtp $ADMIN_EMAIL"

  echo "🕒 Sleeping for 24 hours..."
  sleep 86400
  echo "🔄 Waking up to check certs again."
done
