# ----------------------------
# Base Stage for Dependencies
# ----------------------------
    FROM node:22.13.1-alpine AS base

    WORKDIR /app
    
    # Copy root and package files for workspace dependency resolution
    COPY package.json ./
    COPY yarn.lock ./
    COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
    COPY libs/types/package.json ./libs/types/package.json
    
    # Install all dependencies using Yarn workspaces
    RUN yarn install --frozen-lockfile
    
    # ----------------------------
    # Runtime Stage
    # ----------------------------
    FROM node:22.13.1-alpine
    
    # Set WORKDIR to homepage-app so Yarn finds scripts in its package.json
    WORKDIR /app/apps/frontend/homepage-app
    
    # Copy homepage-app package.json and monorepo root for yarn context
    COPY apps/frontend/homepage-app/package.json ./package.json
    COPY package.json /app/package.json
    COPY yarn.lock /app/yarn.lock
    
    # Reinstall only production deps scoped to this workspace
    RUN yarn install --frozen-lockfile --production
    
    # Copy frontend app source code
    COPY apps/frontend/homepage-app/ ./
    
    # Copy shared libs
    COPY libs /app/libs
    
    # Copy config files
    COPY tsconfig.json /app/tsconfig.json
    COPY apps/frontend/homepage-app/tsconfig.json ./tsconfig.json
    COPY apps/frontend/homepage-app/next.config.ts /app/next.config.ts
    
    # Copy environment files
    COPY apps/frontend/homepage-app/.env .env
    COPY apps/frontend/homepage-app/.env.localareanetwork .env.localareanetwork
    
    # Copy startup script
    COPY ./docker/scripts/wait-and-start-frontend.sh /usr/local/bin/wait-and-start-frontend.sh
    RUN chmod +x /usr/local/bin/wait-and-start-frontend.sh
    
    # Set production environment
    ENV NODE_ENV=production
    
    EXPOSE 3000
    
    ENTRYPOINT ["/usr/local/bin/wait-and-start-frontend.sh"]
    