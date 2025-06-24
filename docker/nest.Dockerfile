# ─── Stage 1: Builder ─────────────────────────────────
FROM node:22-alpine AS builder

# Install required build tools
RUN apk add --no-cache \
    bash \
    curl \
    openssl \
    ca-certificates \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /src/app

# 1) Copy manifests & root TS config
COPY package.json yarn.lock tsconfig.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY libs/types/package.json libs/types/package.json
COPY libs/shared/package.json libs/shared/package.json

RUN yarn install --frozen-lockfile

# 2) Copy source & each package’s tsconfig
COPY apps/backend                    apps/backend
COPY apps/backend/tsconfig.json      apps/backend/tsconfig.json
COPY apps/backend/tsconfig.build.json apps/backend/tsconfig.build.json

COPY libs/shared                    libs/shared
COPY libs/shared/tsconfig.json      libs/shared/tsconfig.json

COPY libs/types                     libs/types
COPY libs/types/tsconfig.json       libs/types/tsconfig.json

# 3) Copy environment files
COPY docker/.env                      .env
COPY apps/backend/.env                apps/backend/.env
COPY apps/backend/.env.localareanetwork apps/backend/.env.localareanetwork

# 4) Generate & build everything
RUN yarn workspace @user-management/shared build
RUN yarn workspace @user-management/types build
RUN yarn workspace user-management-backend prisma generate
RUN yarn workspace user-management-backend build

# ─── Stage 2: Runner ──────────────────────────────────
FROM node:22-alpine AS runner

# Install runtime tools
RUN apk add --no-cache \
    bash \
    curl \
    openssl \
    ca-certificates \
    libc6-compat


WORKDIR /src/app

# Copy runtime manifests
COPY --from=builder /src/app/package.json                   ./package.json
COPY --from=builder /src/app/apps/backend/package.json      ./apps/backend/package.json
COPY --from=builder /src/app/libs/types/package.json        ./libs/types/package.json
COPY --from=builder /src/app/libs/shared/package.json       ./libs/shared/package.json

# Copy built libs so they resolve at runtime
COPY --from=builder /src/app/libs/shared/dist               ./libs/shared/dist
COPY --from=builder /src/app/libs/types/dist                ./libs/types/dist

# Install production deps (will link your local workspaces)
RUN yarn install --production --frozen-lockfile

# Copy Prisma client
COPY --from=builder /src/app/node_modules/.prisma           ./node_modules/.prisma

# Copy built backend
COPY --from=builder /src/app/apps/backend/dist              ./apps/backend/dist
COPY --from=builder /src/app/apps/backend/prisma            ./apps/backend/prisma
COPY --from=builder /src/app/apps/backend/scripts           ./apps/backend/scripts
COPY --from=builder /src/app/apps/backend/tsconfig.json     ./apps/backend/tsconfig.json
COPY --from=builder /src/app/apps/backend/tsconfig.build.json ./apps/backend/tsconfig.build.json

# Copy entrypoint scripts and env
COPY docker/scripts/wait-and-start-nest.sh                  /usr/local/bin/wait-and-start-nest.sh
COPY docker/scripts/wait-for-it.sh                          /wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-and-start-nest.sh /wait-for-it.sh

COPY docker/.env                                            .env
COPY apps/backend/.env                                      apps/backend/.env
COPY apps/backend/.env.localareanetwork                     apps/backend/.env.localareanetwork

EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/wait-and-start-nest.sh"]
