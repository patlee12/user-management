# ─── Builder Stage ────────────────────────────────────────
FROM node:22.13.1-alpine AS builder
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

# Set working dir to homepage-app
WORKDIR /app/apps/frontend/homepage-app

# Perform the build so we can copy dist files into runtime image
RUN yarn build:docker

# ─── Runner Stage ─────────────────────────────────────────
FROM node:22.13.1-alpine AS runner
WORKDIR /app/apps/frontend/homepage-app

# Copy Next.js production build and public assets
COPY --from=builder /app/apps/frontend/homepage-app/.next    ./.next
COPY --from=builder /app/apps/frontend/homepage-app/public   ./public
COPY --from=builder /app/apps/frontend/homepage-app/package.json ./package.json

# Copy built shared libs
COPY --from=builder /app/libs/shared/dist  ../../libs/shared/dist
COPY --from=builder /app/libs/types/dist   ../../libs/types/dist

# Copy node_modules
COPY --from=builder /app/node_modules       ./node_modules

# Copy wait-and-build script
COPY docker/scripts/wait-and-build-frontend.sh /usr/local/bin/wait-and-build-frontend.sh
RUN chmod +x /usr/local/bin/wait-and-build-frontend.sh

# Copy final runtime .env
COPY apps/frontend/homepage-app/.env .env

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/wait-and-build-frontend.sh"]
