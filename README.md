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

### Workspaces

- **`apps/backend`**: Designated for backend applications, currently just Nest.js.
- **`apps/frontend`**: Designated for frontend applications, currently just one built with Next.js.
- **`docker`**: Contains all Docker-related files and configurations.

---

## Setup

### Prerequisites

1. **Node v22.13.1**
2. **Yarn v1.22.22**
3. **Docker**

### Environment `.env` Files

This project uses **three `.env` files** if you want to read them before generating passwords take a look at `.env.template` file in each of the three workspaces:

1. **`docker/.env.template`**: Contains shared environment variables used across the entire monorepo.
2. **`apps/frontend/homepage-app/.env.template`**: Contains environment variables specific to the homepage application built with Next.js.
3. **`apps/backend/.env.template`**: Contains environment variables specific to the user-management **backend** application built with Nest.js.

Each file has a specific role in the project, and each needs to have passwords generated before the project can run. One thing to note, you will need to manually setup email api keys with an email service provider if you want to use the email service and then populate these env variables: `MAIL_SERVICE_PROVIDER="gmail"` `EMAIL_USER=""` `EMAIL_PASS=""`

### Running the App in a Local Area Network (Production Environment)

The following steps will deploy the project using docker and will be discoverable on your local area network using the docker .env variable `AVAHI_HOSTNAME="user-management"`.
If host name remains same, the base url will be <https://user-management.local/> .

To get started, you’ll need to build and run the Docker containers for the entire stack.

```bash
# Install dependencies top level repo
yarn install

# Generate .env files. Then verify Admin email and password in docker .env file.
yarn "env:generate:files"

# Generate nginx certs.
yarn "certs:generate:nginx"

# Run the local area network production deployment (includes Avahi for mDNS and Nginx as reverse proxy)
yarn localareanetwork:prod
```

After a minute or so, the applications should all be available. It may take a little while for Avahi to finish deploying while it resolves .local domain. There will be printed statements in terminal giving you the links to each app.

```bash
# Reset if needed (Warning! database will reset)
yarn reset:localareanetwork
```

### Running the App in Development Environment

To run the app in a development environment, verify the `.env` file is set `NODE_ENV='Development'` and ensure that `ENABLE_SWAGGER='true'`.

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

## More Development CLI commands

The commands below are from the `package.json` file in the **`apps/backend`** folder. You must be in the backend directory to run them and they are not required to be run only informational.

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

## Docker Tips

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
