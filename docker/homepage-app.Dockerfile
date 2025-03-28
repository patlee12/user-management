# Stage 1: Builder
FROM node:22.13.1-alpine AS builder

WORKDIR /app

# Copy monorepo-level package files and lockfile
COPY package.json yarn.lock ./

# Copy workspace-level package.json files
COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
COPY libs/types/package.json ./libs/types/package.json

# Install dependencies using Yarn Workspaces
RUN yarn install --frozen-lockfile

# Copy source files for homepage-app and shared libs
COPY apps/frontend/homepage-app ./apps/frontend/homepage-app
COPY libs ./libs

# Copy tsconfig files
COPY tsconfig.json ./
COPY apps/frontend/homepage-app/tsconfig.json ./apps/frontend/homepage-app/tsconfig.json

# Also flatten next.config.ts so it's available in production image
COPY apps/frontend/homepage-app/next.config.ts ./next.config.ts

# Build the homepage-app
WORKDIR /app/apps/frontend/homepage-app
RUN yarn build


# Stage 2: Production Image
FROM node:22.13.1-alpine

WORKDIR /app

# Copy homepage-only package.json and install prod deps
COPY apps/frontend/homepage-app/package.json ./
RUN yarn install --frozen-lockfile --production

# Copy built assets and static files
COPY --from=builder /app/apps/frontend/homepage-app/.next ./.next
COPY --from=builder /app/apps/frontend/homepage-app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy the wait-and-start script
COPY ./docker/scripts/wait-and-start-frontend.sh /usr/local/bin/wait-and-start-frontend.sh
RUN chmod +x /usr/local/bin/wait-and-start-frontend.sh

ENTRYPOINT ["/usr/local/bin/wait-and-start-frontend.sh"]
