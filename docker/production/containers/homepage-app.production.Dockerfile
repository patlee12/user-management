# ----------------------------
# Stage 1: Builder (install deps, build shared/types, build Next)
# ----------------------------
FROM node:22.14.0-alpine AS builder

WORKDIR /app

# 1) Copy root and workspace package files
COPY package.json ./
COPY apps/frontend/homepage-app/package.json apps/frontend/homepage-app/package.json
COPY libs/types/package.json libs/types/package.json
COPY libs/shared/package.json libs/shared/package.json

# 2) Copy all source code
COPY apps/frontend/homepage-app apps/frontend/homepage-app
COPY libs/types libs/types
COPY libs/shared libs/shared

# 3) Install dependencies for all workspaces
RUN yarn install --frozen-lockfile

# 4) Compile shared and types packages so that Next.js can import them
RUN yarn workspace @user-management/shared build
RUN yarn workspace @user-management/types build

# 5) Build the Next.js application
WORKDIR /app/apps/frontend/homepage-app
RUN yarn build


# ----------------------------
# Stage 2: Runner - Production Runtime
# ----------------------------
FROM node:22.14.0-alpine AS runner

WORKDIR /app

# 1) Copy the built Next.js output and public folder
COPY --from=builder /app/apps/frontend/homepage-app/.next ./.next
COPY --from=builder /app/apps/frontend/homepage-app/public ./public

# 2) Copy node modules
COPY --from=builder /app/node_modules ./node_modules

# 3) Copy homepage app’s package.json
COPY --from=builder /app/apps/frontend/homepage-app/package.json ./package.json

# 4) Set NODE_ENV for production
ENV NODE_ENV=production

# 5) Expose Next’s default port
EXPOSE 3000

# 6) Start the Next.js server
CMD ["yarn", "start"]
