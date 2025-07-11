# User Management Monorepo

This is a **monorepo** that provides a full-stack application boilerplate with separate applications for the backend and frontend. The backend is built using **NestJS**, while the frontend includes a Homepage Application built using **Next.js**. This project also includes Docker configurations for three deployment environments—**local development**, **local area network deployment** using Avahi for service discovery, and **production deployment with a public domain**— both local area network and production deployments use Nginx as a reverse proxy.

Live Demo:
<https://user-management.net>

---

## Goals of the Project

This monorepo is focused on providing boilerplate code for a full-stack application that includes a robust **user management system**, featuring:

- **User login**, **User Profiles**, **account creation requests**, **email verification**, and **password recovery**
- **JWT-based authentication**, **OAuth login (Google)**, **Terms of Use Tracking**, **multi-factor authentication (MFA)**, and **role-based authorization**
- An **Admin Panel** powered by **AdminJS** for managing users and roles
- Integration with **Nginx** as a reverse proxy, supporting both:
  - **LAN-based deployments** with mDNS-based service discovery via **Avahi**
  - **Domain-based deployments** using subdomains and automated HTTPS configuration
- A modular, scalable architecture that can easily pivot to a **microservices** design
- Built-in **deployment scripts** for all environments, making development, LAN, and production deployments **frictionless and automated**

---

## Monorepo Structure

This project is structured as a **monorepo**, where both frontend and backend applications live in separate folders but share dependencies and configurations.

### Workspaces

- [`apps/backend`](./apps/backend): NestJS-based backend
- [`apps/frontend`](./apps/frontend): Frontend apps, currently includes a Next.js homepage
- [`docker`](./docker): Contains all Docker-related files and deployment configs

---

## Environment `.env` Files

This project uses **deployment-specific environment templates**. You must generate secure values from these templates before running the stack.

---

### 1. Development Environment

Used when selecting **"Dev (dev mode)"** in `./run-local-build.sh`.

- [`docker/.env.template`](./docker/.env.template)
- [`apps/backend/.env.template`](./apps/backend/.env.template)
- [`apps/frontend/homepage-app/.env.template`](./apps/frontend/homepage-app/.env.template)

---

### 2. Local Area Network Deployment (`.local`)

Used when selecting **"Production Local Area Network (.local) deployment"**.

- [`docker/.env.template`](./docker/.env.template)
- [`apps/backend/.env.localareanetwork`](./apps/backend/.env.localareanetwork)
- [`apps/frontend/homepage-app/.env.localareanetwork`](./apps/frontend/homepage-app/.env.localareanetwork)

> Note: Avahi is required for `.local` mDNS resolution across the LAN, please see additional steps for non-Ubuntu operating systems below.

---

### 3. Production Deployment (Public HTTPS)

Used when selecting **"Production Build (With Domain and Subdomains)"**.

- [`docker/production/.env.production.template`](./docker/production/.env.production.template)
- [`apps/backend/.env.production.template`](./apps/backend/.env.production.template)
- [`apps/frontend/homepage-app/.env.production.template`](./apps/frontend/homepage-app/.env.production.template)

> The deployment script will prompt you to set your real domain, email, certificate, and Google OAuth configuration values before deploying.

---

### Email Configuration

The following variables must be set with valid credentials for any environment that sends email:

```env
MAIL_SERVICE_PROVIDER="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"    **(note: do not use your login password here it must be an api key password)**

```

## Deployment Options

The project supports **three environments** that you can choose from when running:

```bash
./run-local-build.sh
```

### 1️⃣ Development Environment (Dev mode)

Use this mode for local development. It mounts files live, and runs HTTPS on `https://localhost:3000`.

Ensure these values are set in your `.env`:

- `NODE_ENV=Development`
- `ENABLE_SWAGGER=true`

> When running Dev mode two windows will open for both the Next.js and NestJS apps you must proceed with accepting the self signed certs for both before trying to use them. The Next.js app will not be able to make api calls without you accepting the NestJS app's certificate in the browser.

```bash
# From repo root, choose "Dev (dev mode)" when prompted
./run-local-build.sh
```

---

### 2️⃣ Production Deployment on Local Area Network (Private HTTPS via `.local`)

This option deploys the full stack in Docker with `.local` mDNS resolution using Avahi.

```bash
# From repo root, choose "Production Local Area Network (.local) deployment" when prompted
./run-local-build.sh
```

- Hostname becomes `https://user-management.local` by default
- Requires Avahi on host or will launch a Multipass VM to provide `.local` support
- Best for local testing across multiple machines

On non Ubuntu OS like macOS or Windows, [`run-in-vm.sh`](./scripts/internal/run-in-vm.sh) spins up a Multipass-based Ubuntu VM and runs Docker there with Avahi support.

---

### 3️⃣ Production Deployment (Public HTTPS with Real Domain)

This mode deploys the application to a real domain using HTTPS, either via **Let's Encrypt** or using **manually provided certificates**.

It also includes the following automation features:

- **Environment file generation** with dynamic variable resolution and secret validation
- **Login with Google** configuration prompt.
- **Snapshot logging** of all generated `.env` files to assist with debugging and auditing
- **Secure handling of secrets** such as SMTP credentials, JWT keys, and admin passwords
- **SSL Certificate Support** with two options (prompts for choice) set by `USE_MANUAL_CERTS=true` or `USE_MANUAL_CERTS=false` flags.
  - If `true`, points to directory containing manual certificate files
  - If `false`, automatically runs Let's Encrypt to request new certs
- **Automatically generates Fallback** self-signed certificates if Let's Encrypt fails
- **Automatically boots Nginx in fallback mode** first, then switches to real certs after issuance
- **ACME challenge files** are generated to ensure Nginx can serve validation files
- **Nginx is reloaded automatically** once real certs are issued successfully
- **Full Docker image build and deployment** after cert resolution
- **Cleanup** of all temporary challenge files post-deployment

```bash
# From repo root, choose "Production Build (With Domain and Subdomains)" when prompted
./run-local-build.sh
```

## Example Configuration Using `DOMAIN_HOST=user-management.net`

- **Automatic HTTPS via Let's Encrypt**
  Certificates are automatically provisioned and renewed using Let's Encrypt.

- **Manual Certificate Support (Optional)**
  To use your own SSL certificates, place them in the following directory:

  ```bash
  ./docker/production/nginx/certs/live/<YOUR-DOMAIN_HOST>/
  ```

  Ensure this directory contains the following files:

  ```bash
  fullchain.pem  # Your CA-signed certificate
  privkey.pem    # Your private key
  ```

  Replace `<YOUR-DOMAIN_HOST>` with your actual domain, e.g., `user-management.net`.

- **Subdomain Configuration via Environment Variable**

  - The `DOMAIN_HOST` environment variable is used to configure all subdomains.

  - Automatically sets up:

    - `https://user-management.net` (Homepage)
    - `https://api.user-management.net` (API)
    - `https://admin.user-management.net` (Admin Panel)
    - `https://swagger.user-management.net` (Swagger UI)

### DNS Configuration

To ensure subdomains resolve correctly, you must configure DNS records with your domain registrar or DNS provider:

- Create **A record** pointing to your server’s public IP:

  - `@ → YOUR_SERVER_IP`
  - If you are self-hosting remember to login into router and port forward for 80 and 443 to your machine that is hosting.

- Create **CNAME records** that point to a root domain or DNS name (eg. user-management.net or your `DOMAIN_HOST`):
  - `api → user-management.net`
  - `admin → user-management.net`
  - `swagger → user-management.net`

Make sure these DNS records are publicly resolvable **before running Certbot**, or HTTPS certificate generation will fail.

#### Manual Cert Support

If you're providing your own SSL certificates, pick to use manual certs in prompt. Or if you want to edit your current env manually, make sure to update the following:

```env
USE_MANUAL_CERTS=true
```

Place your cert files in:

```bash
docker/production/nginx/certs/live/user-management.net/fullchain.pem
docker/production/nginx/certs/live/user-management.net/privkey.pem
```

## CLI Dev Commands (Backend)

Inside `apps/backend`, you can run:

```bash
# Generate Prisma models
yarn prisma generate

# Run dev DB migrations
yarn prisma migrate dev

# Seed admin data
yarn prisma db seed

# Start the NestJS app
yarn start

# Build the app
yarn build
```

---

## Docker Tips

```bash
# Stop a stuck container
docker stop <container>

# Remove a container
docker rm <container>

# Stop all containers
docker stop $(docker ps -q)

# Force kill a container process
PID=$(docker inspect --format '{{.State.Pid}}' <container>)
sudo kill -9 $PID

# Tear down all containers and volumes
docker compose down --volumes --remove-orphans

# Full Docker clean-up
docker system prune -a --volumes --force
```

---

## Adminer DB Tool

Adminer is bundled to inspect PostgreSQL:

- Dev: <http://localhost:8081>
- LAN: <https://user-management.local/adminer>
- Production: same as dev its not public but it can be configured to be, its just not recommended.

Use `.env` values for credentials:

- **Username**: `admin`
- **Password**: your DB password
- **Database**: `hive-db`

---

## Running Tests

```bash
# Unit tests
yarn test

# End-to-end
yarn test:e2e

# Coverage report
yarn test:cov
```

---

## License

This project is licensed under the [MIT license](./LICENSE).
