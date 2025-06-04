# Stage 1: Builder
FROM node:22.13.1-alpine AS builder

# Install required packages
RUN apk add --no-cache bash openssl libressl curl

# Set working directory to monorepo root
WORKDIR /src/app

# Copy root-level package files
COPY package.json ./

# Copy workspace-level package.json files
COPY apps/backend/package.json ./apps/backend/package.json
COPY libs/types/package.json ./libs/types/package.json
COPY libs/shared/package.json ./libs/shared/package.json

# Install dependencies from scratch
RUN yarn install --frozen-lockfile

# Copy backend source files
COPY apps/backend ./apps/backend

# Copy tsconfig files for compilation
COPY tsconfig.json ./tsconfig.json
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json

# Copy env files
COPY docker/.env .env
COPY apps/backend/.env ./apps/backend/.env
COPY apps/backend/.env.localareanetwork ./apps/backend/.env.localareanetwork

# Run Prisma generate
RUN yarn workspace user-management-backend prisma generate

# Build the backend
RUN yarn workspace user-management-backend build

# Stage 2: Runner
FROM node:22.13.1-alpine AS runner

# Install required runtime tools
RUN apk add --no-cache bash curl libressl

# Set working directory
WORKDIR /src/app

# Copy necessary package files for runtime
COPY --from=builder /src/app/package.json ./
COPY --from=builder /src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /src/app/libs/types/package.json ./libs/types/package.json
COPY --from=builder /src/app/libs/shared/package.json ./libs/shared/package.json

# Install runtime dependencies only (no devDependencies)
RUN yarn install --production --frozen-lockfile
# Copy generated Prisma client into runner
COPY --from=builder /src/app/node_modules/.prisma ./node_modules/.prisma


# Copy built app and required files
COPY --from=builder /src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /src/app/apps/backend/scripts ./apps/backend/scripts
COPY --from=builder /src/app/apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY --from=builder /src/app/apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json

# Copy scripts
COPY ./docker/scripts/wait-and-start-nest.sh /usr/local/bin/wait-and-start-nest.sh
COPY ./docker/scripts/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-and-start-nest.sh /wait-for-it.sh

# Copy environment files
COPY docker/.env .env
COPY apps/backend/.env ./apps/backend/.env
COPY apps/backend/.env.localareanetwork ./apps/backend/.env.localareanetwork

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/wait-and-start-nest.sh"]
