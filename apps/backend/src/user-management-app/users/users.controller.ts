import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '@src/user-management-app/auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { RolesGuard } from '../roles-and-permissions-resources/roles.guard';
import { Roles } from '../roles-and-permissions-resources/roles.decorator';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.usersService.create(createUserDto);
    return await plainToInstance(UserEntity, newUser);
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @Roles('Admin')
  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersService.findAll();
    return await plainToInstance(UserEntity, users);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ${id} does not exist.`);
    }
    return await plainToInstance(UserEntity, user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const updateUser = await this.usersService.update(id, updateUserDto);
    if (!updateUser) {
      throw new NotFoundException(
        `User with ${id} was not updated. Verify correct id is being used.`,
      );
    }
    return await plainToInstance(UserEntity, updateUser);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  @Roles('Admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const deleteUser = await this.usersService.remove(id);
    if (!deleteUser) {
      throw new NotFoundException(
        `User with ${id} was not deleted. Verify correct id is being used.`,
      );
    }
    return await plainToInstance(UserEntity, deleteUser);
  }
}
