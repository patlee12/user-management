# ----------------------------
# Stage 1: Builder
# ----------------------------
  FROM node:22.14.0-alpine AS builder

  # Install required build tools
  RUN apk add --no-cache bash openssl libressl curl
  
  WORKDIR /src/app
  
  # Copy package files
  COPY package.json ./
  COPY apps/backend/package.json ./apps/backend/package.json
  COPY libs/types/package.json   ./libs/types/package.json
  
  # Copy source code and configs
  COPY apps/backend  ./apps/backend
  COPY libs/types    ./libs/types
  COPY tsconfig.json ./tsconfig.json
  COPY apps/backend/tsconfig*.json ./apps/backend/
  
  # Install dependencies
  RUN yarn install --frozen-lockfile
  
  # Generate Prisma client
  RUN yarn workspace user-management-backend prisma generate
  
  # Build the backend
  RUN yarn workspace user-management-backend build
  
  
  # ----------------------------
  # Stage 2: Runtime
  # ----------------------------
  FROM node:22.14.0-alpine AS runner
  
  # Install runtime tools
  RUN apk add --no-cache bash curl libressl
  
  WORKDIR /src/app
  
  # Copy only what's needed from builder
  COPY --from=builder /src/app/package.json                     ./
  COPY --from=builder /src/app/apps/backend/package.json        ./apps/backend/package.json
  COPY --from=builder /src/app/libs/types/package.json          ./libs/types/package.json
  COPY --from=builder /src/app/node_modules                     ./node_modules
  COPY --from=builder /src/app/node_modules/.prisma             ./node_modules/.prisma
  
  # Copy compiled app + Prisma schema
  COPY --from=builder /src/app/apps/backend/dist    ./apps/backend/dist
  COPY --from=builder /src/app/apps/backend/prisma  ./apps/backend/prisma
  
  # Copy env file (assumes mounted or pre‑copied)
  COPY apps/backend/.env ./apps/backend/.env
  
  # Production settings
  ENV NODE_ENV=production
  EXPOSE 3001
  
  # ----------------------------
  # Start‑up command
  # ----------------------------
  # 1) run migrations
  # 2) conditionally seed admin user
  # 3) start NestJS
  CMD ["sh", "-c", "yarn workspace user-management-backend prisma migrate deploy && yarn workspace user-management-backend seed:admin && yarn workspace user-management-backend start:prod"]
  