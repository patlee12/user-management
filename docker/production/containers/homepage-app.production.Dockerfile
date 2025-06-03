# ----------------------------
# Base Stage – Install Dependencies for Caching
# ----------------------------
    FROM node:22.14.0-alpine AS base

    WORKDIR /app
    
    # Copy package files
    COPY package.json ./
    COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
    COPY libs/types/package.json ./libs/types/package.json
    COPY libs/shared/package.json ./libs/shared/package.json

    # Copy source code
    COPY apps/frontend/homepage-app ./apps/frontend/homepage-app
    COPY libs/types ./libs/types
    
    # Install all dependencies
    RUN yarn install --frozen-lockfile
    
    # ----------------------------
    # Final Stage – Production Runtime
    # ----------------------------
    FROM node:22.14.0-alpine

    WORKDIR /app
    
    # Copy node_modules and source from base
    COPY --from=base /app/node_modules ./node_modules
    COPY --from=base /app/apps ./apps
    COPY --from=base /app/libs ./libs
    COPY --from=base /app/package.json ./
    
    # Set static environment
    ENV NODE_ENV=Production
    
    # Move into app directory
    WORKDIR /app/apps/frontend/homepage-app
    
    # Build Next.js app with production env baked in
    RUN yarn build
    
    # Expose the app
    EXPOSE 3000
    
    # Start the server
    CMD ["yarn", "start"]
    