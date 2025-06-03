# ----------------------------
# Base Stage – Install Dependencies for Caching
# ----------------------------
    FROM node:22.13.1-alpine AS base

    WORKDIR /app
    
    # Copy root & workspace package files
    COPY package.json ./
    COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
    COPY libs/types/package.json ./libs/types/package.json
    COPY libs/shared/package.json ./libs/shared/package.json

    # Copy workspace source code
    COPY apps/frontend/homepage-app ./apps/frontend/homepage-app
    COPY libs/types ./libs/types
    
    # Install all dependencies (including devDeps for build-time usage)
    RUN yarn install --frozen-lockfile
    
    # ----------------------------
    # Final Stage – Re-build at Runtime
    # ----------------------------
    FROM node:22.13.1-alpine
    
    WORKDIR /app
    
    # Copy node_modules from base
    COPY --from=base /app/node_modules ./node_modules
    
    # Copy all source code and build context
    COPY --from=base /app/apps ./apps
    COPY --from=base /app/libs ./libs
    COPY --from=base /app/package.json ./
    
    # Copy entrypoint script from project root (build context)
    COPY docker/scripts/wait-and-build-frontend.sh /usr/local/bin/wait-and-build-frontend.sh
    RUN chmod +x /usr/local/bin/wait-and-build-frontend.sh
    
    # Runtime environment
    ENV NODE_ENV=Production
    EXPOSE 3000
    
    # Entrypoint script will:
    #  - Wait for hostname to resolve
    #  - Set NEXT_PUBLIC_BACKEND_URL
    #  - Run `yarn build` with env baked in
    #  - Then `yarn start`
    ENTRYPOINT ["/usr/local/bin/wait-and-build-frontend.sh"]
    