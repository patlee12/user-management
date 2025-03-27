# User Management Monorepo

This is a **monorepo** that provides a full-stack application boilerplate with separate applications for the backend and frontend. The backend is built using **Nest.js**, while the frontend so far has a Homepage Application that is built using **Next.js**. This project also includes Docker configurations for local development and production environments, including Avahi for service discovery and Nginx as a reverse proxy.

## Goals of the Project

This monorepo is focused on providing boilerplate code for a full stack application that requires having a **user management system** with features such as:

- **User login**, **account creation requests**, **email verification**, and **password recovery**.
- **JWT-based authentication**, **multi-factor authentication (MFA)**, and **role-based authorization**.
- An **Admin Panel** powered by **Admin.js** for managing users and roles.
- Integration with **Nginx** (as a reverse proxy) and **Avahi** (for mDNS-based service discovery) to enable seamless operation in local area network setups.

The application is designed to be easily extendable and adaptable, as well as allowing you to pivot to a microservices architecture if needed.

---

## Monorepo Structure

This project is structured as a **monorepo**, where both the frontend and backend applications and services live in separate folders, but share dependencies and configurations.

### Workspaces:

- **`apps/backend`**: Contains the backend application, built with Nest.js.
- **`apps/frontend`**: Contains the frontend application, built with Next.js.
- **`docker`**: Contains all Docker-related files and configurations.

---

## Setup

### Prerequisites

1. **Node v22.13.1**
2. **Yarn v1.22.22**
3. **Docker**

### Create `.env` Files

This project uses **three `.env` files** if you need a template look for the `.env.template` file in each of the three workspaces:

1. **Docker `.env`**: Contains shared environment variables used across the entire monorepo.
2. **Frontend `.env`**: Contains environment variables specific to the **frontend** (Next.js).
3. **Backend `.env`**: Contains environment variables specific to the **backend** (Nest.js).

Each file has a specific role in the project, and each should be placed in the appropriate directory.

---

## Create SSL Certificates for Nginx (For Local Area Network Deployment)

This project uses **Nginx** as a reverse proxy to handle all incoming connections. Before running Docker, you need to generate a valid SSL certificate for **Nginx**.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048   -keyout ./docker/nginx/certs/nginx-selfsigned.key   -out ./docker/nginx/certs/nginx-selfsigned.crt
```

Make sure the paths are correct in the Nginx Docker configuration.

---

#### 1. **Docker `.env` File** (Shared Variables)

Create a `.env` file in the docker folder at root level of the project with the following content:

```bash
# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32

## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"

## Avahi
AVAHI_START_DAEMON="true"
DISABLE_SYSTEMD="true"
AVAHI_HOSTNAME="user-management"
RESOLVED_HOST=""

# Admin Email
ADMIN_EMAIL = "admin@user-management.net"

# openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32
ADMIN_PASSWORD = ""
```

#### 2. **Frontend `.env` File** (Frontend-Specific Variables)

Create a `.env` file in the **`apps/frontend`** folder with the following content:

```bash
# Backend URL
BACKEND_URL="http://localhost:3000"
```

#### 3. **Backend `.env` File** (Backend-Specific Variables)

Create a `.env` file in the **`apps/backend`** folder with the following content:

```bash
## User-Management (Nest.js)


# Make your own passwords!! Use open SSL to generate your own secrets.
# ie. For plain string passwords use open terminal and type: openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32


# Development or Production
NODE_ENV ="Development"

# Turn on swagger module (For endpoint Testing) Recommend to disable this in a production deployment.
ENABLE_SWAGGER ='true'

## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"

## DATABASE_URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"

# JWT server secret. openssl rand -base64 256
JWT_SECRET=""

# Mfa Encryption Key openssl rand -hex 256.
MFA_KEY=""

# Email service account and password currently using google SMTP server.
MAIL_SERVICE_PROVIDER="gmail"
EMAIL_USER=""
EMAIL_PASS=""

# Front End URL
FRONTEND_URL=""

# AdminJs cookie secret.  openssl rand -base64 256
COOKIE_SECRET=""

# Used if nginx needs to resolve the path (i.e. docker-compose-localareanetwork.yml needs /nestjs)
GLOBAL_PREFIX=""
```

---

### Running the App in a Local Area Network (Production Environment)

The following steps will deploy the project using docker and will be discoverable on your local area network using the docker .env variable set earlier `AVAHI_HOSTNAME="user-management`.
If host name remains same, the base url will be https://user-management.local/ .

To get started, you’ll need to build and run the Docker containers for the entire stack.

```bash
# Install dependencies top level repo
yarn install

# Start the application using Docker Compose (includes Avahi for mDNS and Nginx as reverse proxy)
yarn localareanetwork:prod

# Reset if needed (Warning! database will reset)
yarn reset:localareanetwork
```

After a minute or so, the application should be available. It may take a little while for Avahi to finish deploying. There will be printed statements in terminal giving you the links to each app.

## Docker Setup

If a container gets stuck (e.g., the PostgreSQL container), here are some useful commands:

```bash
# Stop the stuck container
docker stop <container-name>

# Remove the container
docker rm <container-name>

# Kill process inside container if needed
docker inspect --format '{{.State.Pid}}' <container-name>
sudo kill -9 <PID>

# Remove volumes and rebuild
docker compose down --volumes --remove-orphans
```

### Running the App in Development Environment

To run the app in a development environment, change the `.env` file to set `NODE_ENV='Development'` and ensure that `ENABLE_SWAGGER='true'`.

```bash
# Install dependencies top level repo
yarn install

# Start project in dev mode. This will also pull some .env variables from the project root .env in /docker/.env
yarn dev

# Stop and remove dev containers
yarn dev:docker:down

# Reset database (Warning! will lose data)
yarn dev:database:reset

```

# More Development CLI commands

The commands below are from the `package.json` file in the **`apps/backend`** folder. You must be in the backend directory to run them.

```bash
### Below are commands typically used while developing but not required #####

# Generate Prisma models
yarn prisma generate

# Run migrations (Development)
yarn prisma migrate dev

# If you want to seed the database with admin seed data
yarn prisma db seed

# Run the application
yarn start

# Build the application
yarn build
```

---

## Adminer DB Tool

To interact with the PostgreSQL database via **Adminer**:

1. Go to **[http://localhost:8081](http://localhost:8081)** in development.
2. For local area network deployment with **production**, access **Adminer** at [https://user-management.local/adminer](https://user-management.local/adminer).
3. Use the following credentials (from your `.env` file):
   - **Username**: `admin`
   - **Password**: `<your-password>`
   - **Database**: `hive-db`

---

## Running Tests

You can run tests using Yarn:

```bash
# Unit tests
yarn test

# End-to-end tests
yarn test:e2e

# Test coverage
yarn test:cov
```

---

## License

This project is licensed under the [MIT license](LICENSE).
