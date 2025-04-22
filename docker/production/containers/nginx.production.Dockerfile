FROM nginx:1.27-alpine-slim

# Install bash and gettext for envsubst (environment variable substitution)
RUN apk add --no-cache bash gettext

# Remove the default.conf to prevent it from loading an invalid cert path
RUN rm -f /etc/nginx/conf.d/default.conf

# Create necessary directories for logs and self-signed certs
RUN mkdir -p /var/log/nginx /etc/nginx/certs/self-signed

# Copy the generated Nginx config (created by build-nginx-config.sh before build)
COPY ./docker/production/nginx/nginx.production.conf /etc/nginx/nginx.conf

# Copy ACME challenge folder for Let's Encrypt (used for cert validation)
COPY ./docker/production/nginx/www /var/www/html

# Copy reusable proxy headers config
COPY ./docker/production/nginx/proxy-headers.conf /etc/nginx/proxy-headers.conf

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start Nginx in the foreground
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
