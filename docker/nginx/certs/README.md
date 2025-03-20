# Create certs for Nginx

Make sure to verify paths on nginx config (It defaults to this folder). Note all connections are routed through nginx (reverse proxy) so make sure to have this cert be valid and track when it expires.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/nginx-selfsigned.key \
  -out ./certs/nginx-selfsigned.crt


```
