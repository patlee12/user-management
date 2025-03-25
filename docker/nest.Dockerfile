FROM node:22.13.1-alpine

# Install necessary tools: bash, OpenSSL, libressl, curl
RUN apk add --no-cache bash openssl libressl curl

# Install wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Set working directory
WORKDIR /src/app

# Copy package.json and lock file
COPY apps/backend/package*.json ./

# Copy backend source files
COPY apps/backend ./

# Copy env files
COPY docker/.env ./
COPY apps/backend/.env ./apps/backend/.env

# Copy tsconfig
COPY tsconfig.json ./apps/backend/tsconfig.json

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Nest CLI
RUN yarn global add @nestjs/cli

# Run Prisma generate
RUN yarn prisma generate

# Clean dist before build
RUN rm -rf dist

# Build the app
RUN yarn build

# Expose port
EXPOSE 3001

COPY ./docker/scripts/wait-and-start-nest.sh /usr/local/bin/wait-and-start-nest.sh
RUN chmod +x /usr/local/bin/wait-and-start-nest.sh

ENTRYPOINT ["/usr/local/bin/wait-and-start-nest.sh"]
