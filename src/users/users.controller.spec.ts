import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: 6, username: 'Pat' },
              { id: 7, username: 'Cosmo12' },
            ]),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: UserEntity[] = await controller.findAll();

      const simplifiedResult = result.map((user) => ({
        id: user.id,
        username: user.username,
      }));

      expect(simplifiedResult).toEqual([
        { id: 6, username: 'Pat' },
        { id: 7, username: 'Cosmo12' },
      ]);
    });
  });
});
