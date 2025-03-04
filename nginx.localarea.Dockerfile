FROM nginx:alpine

# Install necessary utilities
RUN apk update && apk add --no-cache bash gettext

# Copy the Nginx config and certificates
COPY ./nginx.localarea.conf /etc/nginx/nginx.conf
COPY ./certs /etc/nginx/certs

# Expose the necessary ports
EXPOSE 80 443

# Set the default entrypoint to start NGINX
CMD ["nginx", "-g", "daemon off;"]
