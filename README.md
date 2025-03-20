## User Management

This Nest.js application provides a scalable and secure backend solution for user management and authentication. It includes essential features such as user login, Admin Panel (Admin.js) account creation requests, email verification, password recovery, JWT-based authentication, multi-factor authentication (MFA), and role-based authorization. The application also supports user profile management and integrates with Nginx (as a reverse proxy) and Avahi (for mDNS-based service discovery) to enable seamless operation in local area network setups.

Designed as a boilerplate for monolithic projects, this application follows a modular and opinionated structure, allowing for an easy pivot to a microservices architecture when needed—thanks to the flexibility and scalability of the Nest.js framework.

Included a swagger module for endpoint testing and Admin Module. Once the project is served in your local area network go to https://user-management.local/api for swagger and https://user-management.local/admin for Admin panel (see section "Running the App in a local area network in a Production Environment")

## Dependencies:

1. Node v22.13.1
2. Yarn version v1.22.22
3. Docker

## Create .env file in root directory (Required!)

Template for environment file, please copy the below template and add it to a .env file in the root level of project repository. Also, please generate all your own passwords and secrets (replace generic passwords like "adminpassword") by following the instructions in the comments.

```bash
# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
DATABASE_URL_PROD="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

## Avahi
AVAHI_START_DAEMON="true"
DISABLE_SYSTEMD="true"
AVAHI_HOSTNAME="user-management"


## User-Management (Nest.js)

# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

JWT_SECRET=""

# Development or Production
NODE_ENV ="Production"

# Turn on swagger module (For endpoint Testing) Recommend to disable this in a production deployment.
ENABLE_SWAGGER ='true'

# Stage Production Environment only set to true for first run in production.
STAGING_PRODUCTION="true"

# Admin Email
ADMIN_EMAIL = "admin@user-management.net"

# Admin password openssl rand -base64 32.
ADMIN_PASSWORD = ""

# Mfa Encryption Key openssl rand -hex 32.
MFA_KEY=""

# Email service account and password currently using gmail SMTP server but doesn't require gmail.
MAIL_SERVICE_PROVIDER="gmail"
EMAIL_USER=""
EMAIL_PASS=""

# Front End URL
FRONTEND_URL=""

# AdminJs openssl rand -base64 32
COOKIE_SECRET=""
```

## Running the App in a local area network in a Production Environment

It is recommended to test the project locally using docker before running it in an official production environment like AWS. You also may want to update the run-admin-seed.ts file with specifics related to your project if you have been developing new database models etc.

(Reminder: update all passwords in the .env file)

# Create certs for Nginx

This project uses Nginx as a reverse proxy to handle all incoming connections. Before running Docker, ensure that the Nginx configuration paths are correctly set for your environment. Since all traffic is routed through Nginx, a valid SSL certificate is required—be sure to monitor its expiration to prevent service disruptions.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/nginx-selfsigned.key \
  -out ./certs/nginx-selfsigned.crt
```

## Install Dependencies and Run the App Locally with Docker

The following steps will set up the application and create a `.local` domain on your local area network using Avahi for service discovery.

### Customizing the Hostname

- By default, the hostname is set to `user-management.local`.
- To use a different hostname, update the Avahi configuration and modify the corresponding `.env` `AVAHI_HOSTNAME="user-management"` variable.

### Setup Instructions

```bash
# Install dependencies
yarn install

# Start the application using Docker Compose includes Avahi (MDNS) and Nginx (Reverse proxy) for local network service discovery.
docker compose -f docker-compose-local-area-network.yml up --build

# Run the application in detached mode (background process will continuously run)
docker compose -f docker-compose-local-area-network.yml up -d

```

Give the containers a minute to complete deployment. The Nest.js app will be the last one finished deploying. Then open a browser and go to https://user-management.local/api for the swagger module and https://user-management.local/admin for the Admin.js module. You will need to use `ADMIN_EMAIL and ADMIN_PASSWORD` for logging into admin panel.

## Avahi Tips

Sometimes if you re-start the project a few times in a short period, Avahi can have hostname conflicts. Avahi will automatically resolve it and give you a host name, you just might have to scroll up or check the logs or directly by opening another terminal and typing `docker logs avahi`.

# Docker tips

If a container gets stuck (sometimes needs a reboot). See example below and first run `docker ps ` to find your container:

```bash
sudo docker stop user-management-pgweb-1
sudo docker rm user-management-pgweb-1
sudo docker stop $(sudo docker ps -q)

sudo docker rm -f user-management-pgweb-1


sudo docker inspect --format '{{.State.Pid}}' user-management-pgweb-1
sudo kill -9 <PID>
sudo docker rm user-management-pgweb-1

# Remove volumes and Rebuild.
# (Warning: Removes database!!! if you include volumes)
docker compose down --volumes --remove-orphans



```

## Running the app in Development Environment

First make sure to go to .env file and change `NODE_ENV ='Development'` and also make sure `ENABLE_SWAGGER ='true'` if it isn't.

```bash
# Install dependencies.
$ yarn install

#Setup Prisma ORM.
$ yarn prisma generate

# Run the docker-compose-development.yml which serves postgres and adminer.
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

# Using Adminer DB tool

(Development)
After development container environment is running http://localhost:8081

(Production)
After production container environment is running
https://user-management.local/adminer

Assuming you have this in your .env file:

```bash
## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"
```

1. Select PostgreSQL
2. Username: admin
3. password: mypassword
4. Database: hive-db

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
