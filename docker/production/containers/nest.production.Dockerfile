# ----------------------------
# Stage 1: Builder
# ----------------------------
FROM node:22.14.0-alpine AS builder

# Install required build tools
RUN apk add --no-cache bash openssl libressl curl

WORKDIR /src/app

# 1) Copy root level package.json & yarn.lock
COPY package.json yarn.lock ./

# 2) Copy backend’s package.json and tsconfig files
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/tsconfig*.json ./apps/backend/

# 3) Copy the entire libs/types and libs/shared folders
COPY libs/types ./libs/types
COPY libs/shared ./libs/shared

# 4) Copy backend source code
COPY apps/backend ./apps/backend

# 5) Copy the monorepo’s root tsconfig.json
COPY tsconfig.json ./

# 6) Install all dependencies
RUN yarn install --frozen-lockfile

# 7) Generate Prisma client for backend
RUN yarn workspace user-management-backend prisma generate

# 8) Build shared + types workspaces first, then build backend
RUN \
  yarn workspace @user-management/shared build && \
  yarn workspace @user-management/types build && \
  yarn workspace user-management-backend build


# ----------------------------
# Stage 2: Runtime
# ----------------------------
FROM node:22.14.0-alpine AS runner

# Install runtime tools
RUN apk add --no-cache bash curl libressl

WORKDIR /src/app

# 1) Copy root package.json
COPY --from=builder /src/app/package.json ./

# 2) Copy backend’s package.json for runtime metadata
COPY --from=builder /src/app/apps/backend/package.json ./apps/backend/package.json

# 3) Copy libs/types and libs/shared folders
COPY --from=builder /src/app/libs/types       ./libs/types
COPY --from=builder /src/app/libs/shared      ./libs/shared

# 4) Copy node modules
COPY --from=builder /src/app/node_modules       ./node_modules
COPY --from=builder /src/app/node_modules/.prisma ./node_modules/.prisma

# 5) Copy compiled backend output and Prisma schema
COPY --from=builder /src/app/apps/backend/dist   ./apps/backend/dist
COPY --from=builder /src/app/apps/backend/prisma ./apps/backend/prisma

# 6) Copy backend’s .env
COPY apps/backend/.env ./apps/backend/.env

# Production settings
ENV NODE_ENV=production
EXPOSE 3001

# ----------------------------
# Start-up command
# ----------------------------
# 1) run migrations
# 2) conditionally seed admin user
# 3) start NestJS
CMD ["sh", "-c", "yarn workspace user-management-backend prisma migrate deploy && yarn workspace user-management-backend seed:admin && yarn workspace user-management-backend start:prod"]
