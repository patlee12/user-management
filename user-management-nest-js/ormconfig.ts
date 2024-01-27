import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'admin',
  password: 'password',
  database: 'user_management',
  synchronize: false,
  logging: true,
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/migrations/*{.ts,.js}')],
  subscribers: [join(__dirname, 'src/subscribers/*{.ts,.js}')],
};

export = config;
