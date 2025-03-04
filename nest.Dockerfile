FROM node:22.13.1-alpine

# Install necessary tools: bash, OpenSSL, libressl, curl
RUN apk add --no-cache bash openssl libressl curl

# Install wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Set working directory
WORKDIR /src/app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy all other source files
COPY . .

# Copy the .env file
COPY .env ./

# Clean dist directory before build
RUN rm -rf dist

# Build your app
RUN yarn build

# Expose the application port
EXPOSE 3000

# Start the application
ENTRYPOINT ["yarn", "start:prod"]
