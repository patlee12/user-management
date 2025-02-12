## User Management

This Nest.js application provides a scalable, secure backend solution for user management and authentication. It includes user login, JWT-based authentication, Multi-factor authentication (MFA), role-based authorization, user profile management, and integration with Nginx (Reverse Proxy) and Avahi (MDNS) for service discovery. This application is designed to be a boilerplate for projects requiring user account login architecture, and can be easily integrated into other projects for rapid deployment of secure user management features.

I've included a swagger module for endpoint testing. Once the project is served go to https://user-management.local/api (see section "Running the App in a Production Environment" for setup)

## Dependencies:

1. Node v22.13.1
2. Yarn version v1.22.22
3. Docker

## Create .env file in root directory (Required!)

Template for environment file please generate all your own passwords (replace generic passwords like "adminpassword") by following the instructions in the comments. Please copy the following and add it to a .env file:

```bash
# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
DATABASE_URL_PROD="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

## PgAdmin
PGADMIN_DEFAULT_EMAIL="admin@pgadmin.com"
PGADMIN_DEFAULT_PASSWORD="adminpassword"
SCRIPT_NAME="/pgadmin"

## Nginx
NGINX_HOST="user-management.local"
NGINX_PROXY="nestjs:3000"

## Avahi
AVAHI_START_DAEMON="true"
DISABLE_SYSTEMD="true"
AVAHI_HOSTNAME="user-management"


## User-Management (Nest.js)

# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

JWT_SECRET=""

# Development or Production
NODE_ENV ="Development"

# Stage Production Environment, if true it deploy database migrations and run admin account seed.
STAGING_PRODUCTION="true"

# Admin Email
ADMIN_EMAIL = "admin@user-management.net"

# Admin password openssl rand -base64 32.
ADMIN_PASSWORD = ""

# Mfa Encryption Key openssl rand -hex 32.
MFA_KEY=""
```

## Running the App in a Production Environment

It is recommended to test the project locally using docker before running it in an official production environment. You also may want to update the run-admin-seed.ts file with specifics related to your project if you have been developing new database models etc.

(Reminder: update all passwords in the .env file)

# Create certs for Nginx

This project uses Nginx as a reverse proxy to handle all incoming connections. Before running Docker, ensure that the Nginx configuration paths are correctly set for your environment. Since all traffic is routed through Nginx, a valid SSL certificate is required—be sure to monitor its expiration to prevent service disruptions.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/nginx-selfsigned.key \
  -out ./certs/nginx-selfsigned.crt
```

# Install Dependencies and Run App in Docker

If you don't want to use "user-management.local" as hostname you can set a host-name in avahi-config and update the .env variable.

```bash
# Install dependencies.
$ yarn install

# Run the project with docker:
$ docker compose up --build

# Keep it running in background by adding the -d flag.
$ docker compose up -d
```

Give the containers a minute to complete deployment. The Nest.js app will be the last one finished deploying. Then open a browser and go to https://user-management.local/api

## Avahi Tips

Sometimes if you re-start the project a few times in a short period, Avahi can have hostname conflicts. Avahi will automatically resolve it and give you a host name, you just might have to scroll up or check the logs or directly by opening another terminal and typing `docker logs avahi`.

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

# Remove and Rebuild.
docker compose down --volumes --remove-orphans



```

## Running the app in Development Environment

```bash
# Install dependencies.
$ yarn install

#Setup Prisma ORM.
$ yarn prisma generate

# Run the docker-compose-development.yml which serves postgres and pgAdmin.
$ docker compose -f docker-compose-development.yml up --build

# Need to run postgres container for this to work.
$ yarn prisma migrate dev

#If you want to seed the db with dummy data.
$ yarn prisma db seed

# development.
$ yarn start

# build.
$ yarn build

# production mode.
$ yarn start:prod
```

## Test

```bash
# unit tests.
$ yarn test

# e2e tests.
$ yarn test:e2e

# test coverage.
$ yarn test:cov
```

## License

This project is [MIT licensed](LICENSE).
