FROM nginx:alpine

# Install necessary utilities
RUN apk update && apk add --no-cache bash gettext

# Copy the Nginx config template and certificates
COPY ./docker/nginx/nginx.localarea.conf.template /etc/nginx/nginx.localarea.conf.template
COPY ./docker/nginx/certs /etc/nginx/certs

# Copy and make the entrypoint executable
COPY ./docker/nginx/entrypoint.sh /etc/nginx/entrypoint.sh
RUN chmod +x /etc/nginx/entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/etc/nginx/entrypoint.sh"]
