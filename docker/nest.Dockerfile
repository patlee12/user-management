FROM node:22.13.1-alpine

# Install necessary tools: bash, OpenSSL, libressl, curl
RUN apk add --no-cache bash openssl libressl curl

# Install wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Set working directory (root of the backend app in the container)
WORKDIR /src/app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY apps/backend/package*.json ./

# Copy all other source files from the backend app
COPY apps/backend ./

# Copy the .env file from the docker folder (needed for the build process)
COPY docker/.env ./

# Copy the backend .env file from the backend folder (needed for backend config)
COPY apps/backend/.env ./apps/backend/.env

# Copy the tsconfig.json into the backend directory
COPY tsconfig.json ./apps/backend/tsconfig.json

# Install dependencies including dev dependencies for Prisma and NestJS CLI
RUN yarn install --frozen-lockfile

# Install @nestjs/cli globally to ensure `nest` command is available
RUN yarn global add @nestjs/cli

# Run Prisma generate to generate client based on schema
RUN yarn prisma generate

# Clean dist directory before build
RUN rm -rf dist

# Build the app
RUN yarn build

# Expose the application port
EXPOSE 3000

# Start the application
ENTRYPOINT ["yarn", "start:prod"]
