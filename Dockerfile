FROM node:22.13.1-alpine

# Install necessary tools: bash, OpenSSL, and libressl
RUN apk add --no-cache bash openssl libressl curl

# Install wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

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

# Copy the .env file
COPY .env ./

# Clean dist directory before build
RUN rm -rf dist

# Build your app
RUN yarn build

# Expose the application port
EXPOSE 3000

# Apply migrations and seed database after Postgres is ready
CMD /wait-for-it.sh postgres:5432 --timeout=30 --strict -- \
    yarn prisma migrate deploy && \
    yarn prisma db seed && \
    yarn start:prod
