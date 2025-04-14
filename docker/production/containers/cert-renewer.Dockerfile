FROM alpine:latest

# Install required packages
RUN apk add --no-cache certbot bash curl ca-certificates

# Create log directory
RUN mkdir -p /var/log/certbot

# Copy the dynamic entrypoint script
COPY ./docker/production/scripts/cert-renewer-entry.sh /usr/local/bin/cert-renewer-entry.sh
RUN chmod +x /usr/local/bin/cert-renewer-entry.sh

# Entrypoint for running certificate renewal
ENTRYPOINT ["/usr/local/bin/cert-renewer-entry.sh"]
