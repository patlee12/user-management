## Create .env file in root directory

Sample env file (For Development):

```bash
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://admin:mypassword@localhost:5432/hive-db"


# Make your own!! Use open SSL to generate your own secret.
# ie. open terminal and type: openssl rand -base64 32

JWT_SECRET=""

# Development or Production
NODE_ENV ="Development"

# Admin password recommend making one similar to JWT_SECRET.
ADMIN_PASSWORD = ""

```

## Installation

```bash
$ yarn install

#Before running docker yml please navigate to readme in certs folder. Use that folder to create required certs for mailing services. Make sure to set the path in yml.

# Also in PRODUCTION: make sure to update all passwords and not use generic ones mentioned.

#Start the PostgreSQL database with docker:
$ docker-compose up

#Keep it running in background or use this for server deployment
$ docker-compose up -d

#Setup Prisma ORM
$ yarn prisma generate
$ yarn prisma migrate dev

#If you want to seed the db with dummy data
$ yarn prisma db seed
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# Docker tips

If pgadmin gets stuck (sometimes needs a reboot)

```bash
sudo docker stop user-management-pgadmin-1
sudo docker rm user-management-pgadmin-1
sudo docker stop $(sudo docker ps -q)

sudo docker rm -f user-management-pgadmin-1


sudo docker inspect --format '{{.State.Pid}}' user-management-pgadmin-1
sudo kill -9 <PID>
sudo docker rm user-management-pgadmin-1



```

## License

This project is [MIT licensed](LICENSE).
