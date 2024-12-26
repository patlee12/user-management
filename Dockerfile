FROM node:18-alpine

# Install OpenSSL and libressl (alternative to OpenSSL) for compatibility
RUN apk add --no-cache openssl libressl

# Check if yarn is already installed, and only install if it's not
RUN if ! command -v yarn > /dev/null 2>&1; then npm install -g yarn; fi

# Set working directory
WORKDIR /src/app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy all other source files
COPY . .

# Clean dist directory before build
RUN rm -rf dist

# Build your app
RUN yarn build

# Check if dist/main.js is created after build
RUN ls -l /src/app/dist
RUN ls -l /src/app/dist/main.js

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["yarn", "start:prod"]
