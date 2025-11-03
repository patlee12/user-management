# Backend Standards — NestJS/Prisma/PostgreSQL

> **Scope**: Backend source in `apps/backend/`
> **Stack**: NestJS 10, Prisma 6, PostgreSQL, JWT auth, TypeScript
> **Goal**: Maintainable modules, type-safe database access, secure APIs

---

## Golden Rules (apply on every edit)

1. **Module-based architecture** - one feature = one module
2. **Dependency injection everywhere** - constructor-based DI, no direct instantiation
3. **DTOs for all I/O** - request validation with `class-validator`, response shaping
4. **Services contain business logic** - controllers delegate to services
5. **Prisma for all database access** - no raw SQL unless absolutely necessary
6. **Guards for auth/authz** - protect routes declaratively
7. **Filters for exception handling** - consistent error responses
8. **Swagger decorators on all endpoints** - keep API docs current
9. **camelCase** for variables/functions, **PascalCase** for classes/decorators

---

## Project Structure

```
apps/backend/src/
├── main.ts                    # App bootstrap
├── app.module.ts              # Root module
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── guards/               # Auth guards
│   ├── interceptors/         # Request/response interceptors
│   └── pipes/                # Validation pipes
├── config/                    # Configuration (env, database)
├── prisma/                    # Prisma schema + migrations
│   ├── schema.prisma
│   └── migrations/
└── modules/                   # Feature modules
    ├── auth/                 # Authentication
    ├── users/                # User management
    ├── posts/                # Example feature
    └── account-requests/     # Account requests
        ├── account-requests.module.ts
        ├── account-requests.controller.ts
        ├── account-requests.service.ts
        ├── dto/
        │   ├── create-account-request.dto.ts
        │   └── update-account-request.dto.ts
        └── entities/
            └── account-request.entity.ts
```

---

## Module Architecture

### 1. Module File (`*.module.ts`)

**Purpose**: Declare dependencies, providers, controllers, exports.

```ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService], // Export if other modules need it
})
export class UsersModule {}
```

**Rules**:

- Import modules (not classes) from other features
- Export services that other modules consume
- Keep modules focused (single responsibility)

---

### 2. Controller File (`*.controller.ts`)

**Purpose**: Handle HTTP requests, delegate to services, return responses.

```ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

**Rules**:

- **Thin controllers** - no business logic, only routing + validation
- **Swagger decorators** on every endpoint (`@ApiOperation`, `@ApiResponse`)
- **Guards** for protected routes (`@UseGuards(JwtAuthGuard)`)
- **HTTP codes** explicit via `@HttpCode()` when not default
- **Params/Body/Query** typed with DTOs

---

### 3. Service File (`*.service.ts`)

**Purpose**: Contain business logic, interact with database via Prisma.

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * create
   * -------------------------------------------------------------
   * Creates a new user with hashed password. Validates unique
   * email constraint at database level.
   *
   * @param createUserDto User creation payload
   * @returns Created user (without password)
   * @throws ConflictException if email already exists
   */
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * findOne
   * -------------------------------------------------------------
   * Retrieves a user by ID. Excludes password from response.
   *
   * @param id User ID (UUID)
   * @returns User object
   * @throws NotFoundException if user not found
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

**Rules**:

- **`@Injectable()` decorator** on all services
- **Constructor injection** for dependencies (Prisma, other services)
- **JSDoc** for all public methods
- **Throw NestJS exceptions** (`NotFoundException`, `BadRequestException`, etc.)
- **Never return passwords** - use Prisma `select` to exclude sensitive fields
- **Hash passwords** with argon2 (never bcrypt or plain text)

---

## DTOs (Data Transfer Objects)

**Purpose**: Validate incoming data, type-safe request/response contracts.

### Request DTO (`create-user.dto.ts`)

```ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'SecureP@ss123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
```

**Rules**:

- **Class-based DTOs** (not interfaces or types)
- **`class-validator` decorators** on every field (`@IsString`, `@IsEmail`, etc.)
- **`@ApiProperty`** for Swagger documentation
- **Examples** in `@ApiProperty` for better docs
- **Optional fields** use `@IsOptional()` + `?` in TypeScript

### Update DTO (`update-user.dto.ts`)

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

**Rules**:

- Use **`PartialType`** to make all fields optional (DRY)
- Use **`PickType`** to select specific fields
- Use **`OmitType`** to exclude specific fields

---

## Entities

**Purpose**: Represent database models in TypeScript (mirrors Prisma schema).

```ts
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'User ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  // Password excluded from entity (never expose in responses)
}
```

**Rules**:

- **Mirror Prisma models** (exclude sensitive fields like `password`)
- **`@ApiProperty`** for Swagger response documentation
- **Used in Swagger `@ApiResponse({ type: User })`**

---

## Prisma Patterns

### Service Integration

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}
```

### Transactions

```ts
async createUserWithProfile(data: CreateUserDto) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data });
    const profile = await tx.profile.create({
      data: { userId: user.id },
    });
    return { user, profile };
  });
}
```

### Relations

```ts
async findUserWithPosts(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true, // Include related posts
    },
  });
}
```

**Rules**:

- **Always use `select`** to exclude sensitive fields (password, tokens)
- **Use transactions** for multi-step operations
- **Use `include`** for relations (avoid N+1 queries)
- **Handle Prisma errors** with try/catch, throw NestJS exceptions

---

## Authentication & Authorization

### JWT Strategy

```ts
// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### JWT Auth Guard

```ts
// auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Usage in Controllers

```ts
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // From JWT payload
}
```

**Rules**:

- **Use Guards** for all protected routes
- **Extract user** from `@Request()` after guard validation
- **Store minimal data** in JWT (id, email only)
- **Refresh tokens** for long-lived sessions (separate endpoint)

---

## Exception Handling

### Custom Exception Filter

```ts
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### Apply Globally

```ts
// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

**Rules**:

- **Throw NestJS exceptions** in services (`NotFoundException`, `BadRequestException`)
- **Use filters** for consistent error responses
- **Log errors** (but don't expose internal details to clients)

---

## Validation

### Global Validation Pipe

```ts
// main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true, // Auto-transform payloads to DTO instances
  }),
);
```

**Rules**:

- **Enable globally** in `main.ts`
- **Whitelist** to prevent mass assignment attacks
- **Transform** for type coercion (string → number, etc.)

---

## Security Best Practices

### Password Hashing

```ts
import * as argon2 from 'argon2';

// Hash password before storing
const hashedPassword = await argon2.hash(plainPassword);

// Verify password during login
const isValid = await argon2.verify(hashedPassword, plainPassword);
```

**Never use bcrypt** (argon2 is more secure).

### Rate Limiting

```ts
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per minute
      },
    ]),
  ],
})
export class AppModule {}
```

### CORS

```ts
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

### Helmet (Security Headers)

```ts
// main.ts
import helmet from 'helmet';

app.use(helmet());
```

**Rules**:

- **Hash passwords** with argon2
- **Rate limit** sensitive endpoints (login, register)
- **Enable CORS** only for trusted origins
- **Use Helmet** for security headers
- **Validate all inputs** with DTOs
- **Never log sensitive data** (passwords, tokens)

---

## Swagger / OpenAPI

### Setup

```ts
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('User Management API')
  .setDescription('API for user authentication and management')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Controller Decorators

```ts
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateUserDto) {
    // ...
  }
}
```

**Rules**:

- **Tag all controllers** with `@ApiTags`
- **Document all endpoints** with `@ApiOperation` and `@ApiResponse`
- **Use entity classes** for response types
- **Keep docs current** (Swagger = source of truth for `@user-management/types`)

---

## Testing

### Unit Tests (Services)

```ts
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find a user by id', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

    const result = await service.findOne('1');
    expect(result).toEqual(mockUser);
  });
});
```

### E2E Tests

```ts
// users.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Rules**:

- **Unit test services** with mocked dependencies
- **E2E test controllers** with real HTTP requests
- **Mock Prisma** in unit tests (don't hit database)
- **Use test database** for E2E tests

---

## Common Patterns

### Pagination

```ts
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.user.findMany({
      skip,
      take: limit,
    }),
    this.prisma.user.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}
```

### Search/Filtering

```ts
async search(query: string) {
  return this.prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}
```

### Soft Deletes

```ts
// Prisma schema
model User {
  id        String    @id @default(uuid())
  deletedAt DateTime?
}

// Service
async softDelete(id: string) {
  return this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

async findAll() {
  return this.prisma.user.findMany({
    where: { deletedAt: null }, // Exclude soft-deleted
  });
}
```

---

## Performance

- **Use Prisma select** to fetch only needed fields
- **Batch queries** with `findMany` instead of N queries
- **Use transactions** for consistency, not performance
- **Index frequently queried fields** in Prisma schema
- **Cache** expensive queries (Redis, in-memory)

---

## When in Doubt

1. **Check existing modules** - follow patterns already in the codebase
2. **Keep services thin** - extract complex logic to helpers
3. **Document edge cases** - JSDoc explains the "why"
4. **Throw early** - validate inputs at entry points (controllers/DTOs)
5. **Test business logic** - unit test services, E2E test critical flows
