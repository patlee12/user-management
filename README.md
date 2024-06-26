## Installation

```bash
$ yarn install

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

## License

This project is [MIT licensed](LICENSE).
