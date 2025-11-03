# ─── Builder Stage ────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy project root package files
COPY package.json yarn.lock tsconfig.json ./

# Copy relevant workspace package files
COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
COPY libs/types/package.json      ./libs/types/package.json
COPY libs/shared/package.json     ./libs/shared/package.json

# Copy source files
COPY apps/frontend/homepage-app    ./apps/frontend/homepage-app
COPY libs/types                    ./libs/types
COPY libs/shared                   ./libs/shared

# Install all deps and build shared libs
RUN yarn install --frozen-lockfile
RUN yarn workspace @user-management/shared build
RUN yarn workspace @user-management/types build

# ─── Runner Stage ─────────────────────────────────────────
FROM node:22-alpine AS runner

# Prepare base context
WORKDIR /app

# Copy full app source for runtime build
COPY --from=builder /app/apps/frontend/homepage-app ./apps/frontend/homepage-app

# Copy built shared libs for module resolution
COPY --from=builder /app/libs/shared  ./libs/shared
COPY --from=builder /app/libs/types   ./libs/types

# Copy node_modules so runtime build can install any missing deps
COPY --from=builder /app/node_modules ./node_modules

# Copy monorepo manifests for workspace mapping
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock    ./yarn.lock

# Now set working dir into the app itself
WORKDIR /app/apps/frontend/homepage-app

# Copy entrypoint script
COPY docker/scripts/wait-and-build-frontend.sh /usr/local/bin/wait-and-build-frontend.sh
RUN chmod +x /usr/local/bin/wait-and-build-frontend.sh

# Copy final runtime .env
COPY apps/frontend/homepage-app/.env .env

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/wait-and-build-frontend.sh"]
