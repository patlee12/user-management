# Create certs for Nginx

make sure to update paths on nginx config. Note all connections are routed through nginx (reverse proxy) so make sure to have this cert be valid and track when it expires.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/nginx-selfsigned.key \
  -out ./certs/nginx-selfsigned.crt


```
