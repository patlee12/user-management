# Stage 1: Builder
FROM node:22.13.1-alpine AS builder

# Install required packages
RUN apk add --no-cache bash openssl libressl curl

# Set working directory to monorepo root
WORKDIR /src/app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace-level package.json files
COPY apps/backend/package.json ./apps/backend/package.json
COPY libs/types/package.json ./libs/types/package.json

# Install dependencies for all workspaces
RUN yarn install --frozen-lockfile

# Copy backend source files
COPY apps/backend ./apps/backend

# Copy tsconfig files (used for ts-node and nest build)
COPY tsconfig.json ./tsconfig.json
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json

# Copy env files
COPY docker/.env .env
COPY apps/backend/.env ./apps/backend/.env
COPY apps/backend/.env.localareanetwork ./apps/backend/.env.localareanetwork

# Run Prisma generate in workspace context
RUN yarn workspace user-management-backend prisma generate

# Build the NestJS app
RUN yarn workspace user-management-backend build

# Stage 2: Runner
FROM node:22.13.1-alpine AS runner

# Install required tools
RUN apk add --no-cache bash curl libressl

# Set working directory
WORKDIR /src/app

# Copy monorepo root so yarn can run from here
COPY --from=builder /src/app/package.json ./package.json
COPY --from=builder /src/app/yarn.lock ./yarn.lock

# Copy backend app package.json for workspace context
COPY --from=builder /src/app/apps/backend/package.json ./apps/backend/package.json

# Copy built app, node_modules, and Prisma
COPY --from=builder /src/app/node_modules ./node_modules
COPY --from=builder /src/app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /src/app/apps/backend/scripts ./apps/backend/scripts
COPY --from=builder /src/app/apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY --from=builder /src/app/apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json

# Copy wait/start scripts
COPY ./docker/scripts/wait-and-start-nest.sh /usr/local/bin/wait-and-start-nest.sh
COPY ./docker/scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-and-start-nest.sh /wait-for-it.sh

# Copy env files
COPY docker/.env .env
COPY apps/backend/.env ./apps/backend/.env
COPY apps/backend/.env.localareanetwork ./apps/backend/.env.localareanetwork

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/wait-and-start-nest.sh"]
