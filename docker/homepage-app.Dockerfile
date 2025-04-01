# ----------------------------
# Build Stage
# ----------------------------
    FROM node:22.13.1-alpine AS builder

    WORKDIR /app
    
    # Copy monorepo root files
    COPY package.json ./
    
    # Copy relevant workspace package.json files
    COPY apps/frontend/homepage-app/package.json ./apps/frontend/homepage-app/package.json
    COPY libs/types/package.json ./libs/types/package.json
    
    # Install deps with workspace support
    RUN yarn install --frozen-lockfile
    
    # Copy app source and shared code
    COPY apps/frontend/homepage-app ./apps/frontend/homepage-app
    COPY libs ./libs
    
    # Copy tsconfig and config files
    COPY tsconfig.json ./
    COPY apps/frontend/homepage-app/tsconfig.json ./apps/frontend/homepage-app/tsconfig.json
    COPY apps/frontend/homepage-app/next.config.ts ./next.config.ts
    
    # Build the frontend using script that disables ESLint
    WORKDIR /app/apps/frontend/homepage-app
    RUN yarn build:docker
    
    # ----------------------------
    # Runtime Stage
    # ----------------------------
    FROM node:22.13.1-alpine
    
    WORKDIR /app
    
    # Copy homepage package.json and install only production deps
    COPY apps/frontend/homepage-app/package.json ./
    ENV NODE_ENV=production
    RUN yarn install --frozen-lockfile --production
    
    # Copy compiled app + static assets
    COPY --from=builder /app/apps/frontend/homepage-app/.next ./.next
    COPY --from=builder /app/apps/frontend/homepage-app/public ./public
    COPY --from=builder /app/next.config.ts ./next.config.ts
    
    # Copy startup script
    COPY ./docker/scripts/wait-and-start-frontend.sh /usr/local/bin/wait-and-start-frontend.sh
    RUN chmod +x /usr/local/bin/wait-and-start-frontend.sh
    
    EXPOSE 3000
    
    ENTRYPOINT ["/usr/local/bin/wait-and-start-frontend.sh"]
    