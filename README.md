## User-Mangement
This NestJS-based application provides a scalable, secure backend solution for user management and authentication. It includes user login, JWT-based authentication, role-based authorization, user profile management, and integration with Nginx (Reverse Proxy) and Avahi (MDNS) for service discovery. This application is designed to be a boilerplate for projects requiring user account login architecture, and can be easily integrated into other projects for rapid deployment of secure user management features.

I've included a swagger module for endpoint testing. Once the project is served go to https://user-management.local/api 

## Dependencies:

1. Node v18.19.1
2. Yarn version v1.22.22
3. Docker

## Create .env file in root directory

Sample env file (For Development):

```bash
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://admin:mypassword@localhost:5432/hive-db"


# Make your own!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

JWT_SECRET=""

# Development or Production
NODE_ENV ="Development"

# Admin password recommend making one similar to JWT_SECRET.
ADMIN_PASSWORD = ""

```
# Create certs for Nginx

make sure to update paths on nginx config. Note all connections are routed through nginx (reverse proxy) so make sure to have this cert be valid and track when it expires.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/nginx-selfsigned.key \
  -out ./certs/nginx-selfsigned.crt


```
## Installation and running the App for Production

```bash
$ yarn install
#Also remember to set a host-name in avahi-config.

# Also in PRODUCTION: make sure to update all passwords and not use generic ones mentioned.

#Run the project with docker:
$ docker compose up --build

#Keep it running in background or use this for server deployment
$ docker compose up -d

#Setup Prisma ORM
$ yarn prisma generate
$ yarn prisma migrate dev

#If you want to seed the db with dummy data
$ yarn prisma db seed
```

## Running the app for development

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# Docker tips

If pgadmin gets stuck (sometimes needs a reboot)

```bash
sudo docker stop user-management-pgadmin-1
sudo docker rm user-management-pgadmin-1
sudo docker stop $(sudo docker ps -q)

sudo docker rm -f user-management-pgadmin-1


sudo docker inspect --format '{{.State.Pid}}' user-management-pgadmin-1
sudo kill -9 <PID>
sudo docker rm user-management-pgadmin-1



```

## Email Server tips

Once you run the docker yml make sure to add a email account in a separate terminal.
Use thunderbird to test email server ([text](https://www.thunderbird.net/en-US/)).

```bash
docker exec -it mailserver setup email add admin@user-management.net password

```

## Avahi Tips

If you have mdns conflicts you sometimes have to flush your cache. Also make sure you have not chosen a hostname that is already in use on your network.

```bash
sudo resolvectl flush-caches
sudo systemctl restart systemd-resolved
sudo systemctl restart NetworkManager

#Verify its still working after flush
systemctl status systemd-resolved


```

## License

This project is [MIT licensed](LICENSE).
