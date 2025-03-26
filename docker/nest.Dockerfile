FROM node:22.13.1-alpine

RUN apk add --no-cache bash openssl libressl curl

# Download wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Set working directory
WORKDIR /src/app

# Copy only package.json and yarn.lock first
COPY apps/backend/package*.json ./

# Copy backend source files **before** install so Prisma schema exists
COPY apps/backend ./         
COPY docker/.env ./
COPY apps/backend/.env ./apps/backend/.env
COPY apps/backend/.env.localareanetwork ./apps/backend/.env.localareanetwork
COPY tsconfig.json ./apps/backend/tsconfig.json

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Nest CLI globally if needed
RUN yarn global add @nestjs/cli

# Generate Prisma client (now schema exists)
RUN yarn prisma generate

# Clean previous build output
RUN rm -rf dist

# Build the app
RUN yarn build

# Expose port
EXPOSE 3001

# Copy and configure startup script
COPY ./docker/scripts/wait-and-start-nest.sh /usr/local/bin/wait-and-start-nest.sh
RUN chmod +x /usr/local/bin/wait-and-start-nest.sh

ENTRYPOINT ["/usr/local/bin/wait-and-start-nest.sh"]
