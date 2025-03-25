# Stage 1: Builder
FROM node:22.13.1-alpine AS builder

WORKDIR /app

# Copy package files and tsconfig.json from the homepage app
COPY apps/frontend/homepage-app/package*.json ./
COPY apps/frontend/homepage-app/tsconfig.json ./

# Install dependencies (including devDependencies)
RUN yarn install --frozen-lockfile

# Copy the entire homepage app source code
COPY apps/frontend/homepage-app/ ./
COPY apps/frontend/homepage-app/app ./app

# Diagnostic step: list all files to verify the "app" folder exists
RUN ls -R /app

# Build the Next.js application
RUN yarn build


# Stage 2: Production Image
FROM node:22.13.1-alpine

WORKDIR /app

# Copy package files and tsconfig.json for production
COPY apps/frontend/homepage-app/package*.json ./
COPY apps/frontend/homepage-app/tsconfig.json ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Ensure node_modules/.bin is in the PATH
ENV PATH="/app/node_modules/.bin:${PATH}"

# Copy built assets and static files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Optionally copy next.config.js if you have one:
# COPY --from=builder /app/next.config.js ./

# ✅ Copy the wait-and-start script from docker/scripts/ (relative to project root)
COPY ./docker/scripts/wait-and-start-frontend.sh /usr/local/bin/wait-and-start-frontend.sh

# ✅ Mark it executable
RUN chmod +x /usr/local/bin/wait-and-start-frontend.sh

# ✅ Use it as the entrypoint
ENTRYPOINT ["/usr/local/bin/wait-and-start-frontend.sh"]

