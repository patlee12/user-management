# Create certs for postfix and dovecot

```bash
openssl req -new -x509 -days 365 -nodes -out postfix.crt -keyout postfix.key

openssl req -new -x509 -days 365 -nodes -out dovecot.crt -keyout dovecot.key

```
