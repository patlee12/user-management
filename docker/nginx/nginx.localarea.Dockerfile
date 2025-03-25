FROM nginx:alpine

# Install necessary utilities
RUN apk update && apk add --no-cache bash gettext

# Copy the Nginx config template and certificates
COPY ./docker/nginx/nginx.localarea.conf.template /etc/nginx/nginx.localarea.conf.template
COPY ./docker/nginx/certs /etc/nginx/certs

COPY ./docker/nginx/entrypoint.sh /etc/nginx/entrypoint.sh
RUN chmod +x /etc/nginx/entrypoint.sh

# Expose the necessary ports
EXPOSE 80 443

# ✅ Use the entrypoint script instead of default CMD
ENTRYPOINT ["/etc/nginx/entrypoint.sh"]
