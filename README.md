# User Management Monorepo

This is a **monorepo** that provides a full-stack application boilerplate with separate applications for the backend and frontend. The backend is built using **Nest.js**, while the frontend is built using **Next.js**. This project also includes Docker configurations for local development and production environments, including Avahi for service discovery and Nginx as a reverse proxy.

## Goals of the Project

This monorepo is focused on providing boilerplate code for a full stack application that requires having a **user management system** with features such as:

- **User login**, **account creation requests**, **email verification**, and **password recovery**.
- **JWT-based authentication**, **multi-factor authentication (MFA)**, and **role-based authorization**.
- An **Admin Panel** powered by **Admin.js** for managing users and roles.
- Integration with **Nginx** (as a reverse proxy) and **Avahi** (for mDNS-based service discovery) to enable seamless operation in local area network setups.

The application is designed to be easily extendable and adaptable, allowing you to pivot to a microservices architecture if needed.

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

This project uses **three `.env` files**:

1. **Docker `.env`**: Contains shared environment variables used across the entire monorepo.
2. **Frontend `.env`**: Contains environment variables specific to the **frontend** (Next.js).
3. **Backend `.env`**: Contains environment variables specific to the **backend** (Nest.js).

Each file has a specific role in the project, and each should be placed in the appropriate directory.

---

#### 1. **Docker `.env` File** (Shared Variables)

Create a `.env` file in the docker folder at root level of the project with the following content:

```bash
# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

## Postgres
POSTGRES_USER="admin"
POSTGRES_PASSWORD="mypassword"
POSTGRES_DB="hive-db"

## Production DATABASE_URL. Development version would need to use "..@localhost:5432.." .
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

## Avahi
AVAHI_START_DAEMON="true"
DISABLE_SYSTEMD="true"
AVAHI_HOSTNAME="user-management"

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

# Make your own passwords!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

JWT_SECRET=""

# Development or Production
NODE_ENV ="Production"

# Turn on swagger module (For endpoint Testing) Recommend to disable this in a production deployment.
ENABLE_SWAGGER ='true'

# Stage Production Environment only set to true if you want the Nest.js app to deploy the database and admin seed file for you.
STAGING_PRODUCTION="true"

# Admin Email
ADMIN_EMAIL = ""

# Admin password openssl rand -base64 32.
ADMIN_PASSWORD = ""

# Mfa Encryption Key openssl rand -hex 32.
MFA_KEY=""

# Email service account and password currently set to gmail but can be changed to others.
MAIL_SERVICE_PROVIDER="gmail"

# Email account (must be email format)
EMAIL_USER=""

# Usually an api key (not your email accounts main password)
EMAIL_PASS=""

# Front End URL
FRONTEND_URL=""

# AdminJs openssl rand -base64 32
COOKIE_SECRET=""
```

---

### Running the App in a Local Area Network (Production Environment)

The following steps will deploy the project using docker and will be discoverable on your local area network using the docker .env variable set earlier `AVAHI_HOSTNAME="user-management`.

To get started, you’ll need to build and run the Docker containers for the entire stack.

```bash
# Install dependencies
yarn install

# Start the application using Docker Compose (includes Avahi for mDNS and Nginx as reverse proxy)
docker compose -f docker/docker-compose-local-area-network.yml up --build

# Run the application in detached mode (background process will continuously run)
docker compose -f docker/docker-compose-local-area-network.yml up -d
```

After a few moments, the application should be available at:

- **Swagger API Docs**: [https://user-management.local/api](https://user-management.local/api)
- **Admin Panel (Admin.js)**: [https://user-management.local/admin](https://user-management.local/admin)

---

## Create SSL Certificates for Nginx

This project uses **Nginx** as a reverse proxy to handle all incoming connections. Before running Docker, you need to generate a valid SSL certificate for **Nginx**.

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048   -keyout ./docker/nginx/certs/nginx-selfsigned.key   -out ./docker/nginx/certs/nginx-selfsigned.crt
```

Make sure the paths are correct in the Nginx Docker configuration.

---

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
# Install dependencies
yarn install

# Setup Prisma ORM
yarn prisma generate

# Run Docker Compose for development (includes Postgres and Adminer)
docker compose -f docker/docker-compose-development.yml up --build

# Run migrations (Development)
yarn prisma migrate dev

# If you want to seed the database with dummy data
yarn prisma db seed

# Run the application
yarn start

# Build the application
yarn build

# Production mode
yarn start:prod
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
