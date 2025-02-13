import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateMfaDto } from './dto/create-mfa.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UpdateMfaDto } from './dto/update-mfa.dto';
import { encryptSecret } from 'src/helpers/encryption-tools';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);

    createUserDto.password = hashedPassword;

    const createUserData = {
      ...createUserDto,
      userRoles: {
        create: await createUserDto.userRoles?.map((role) => ({
          roleId: role.roleId,
          userId: role.userId,
          assignedBy: role.assignedBy,
        })),
      },
    };

    return await this.prisma.user.create({ data: createUserData });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({ where: { id: id } });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }
    const updateUserData = {
      ...updateUserDto,
      userRoles: {
        create: await updateUserDto.userRoles?.map((role) => ({
          roleId: role.roleId,
          userId: role.userId,
          assignedBy: role.assignedBy,
        })),
      },
    };

    return await this.prisma.user.update({
      where: { id: id },
      data: updateUserData,
    });
  }

  async remove(id: number) {
    return await this.prisma.user.delete({ where: { id: id } });
  }

  async createMfaAuth(createMfaDto: CreateMfaDto) {
    const encryptMfaSecret = await encryptSecret(
      createMfaDto.secret,
      process.env.MFA_KEY,
    );
    createMfaDto.secret = encryptMfaSecret;

    return await this.prisma.mfa_auth.create({ data: createMfaDto });
  }

  async updateMfaAuth(userId: number, updateMfaDto: UpdateMfaDto) {
    if (updateMfaDto.secret) {
      const encrytMfaSecret = await encryptSecret(
        updateMfaDto.secret,
        process.env.MFA_KEY,
      );
      updateMfaDto.secret = encrytMfaSecret;
    }
    return await this.prisma.mfa_auth.update({
      where: { userId: userId },
      data: updateMfaDto,
    });
  }

  async findOneMfa(userId: number) {
    return await this.prisma.mfa_auth.findUnique({ where: { userId: userId } });
  }
  async findOneMfaByEmail(email: string) {
    return await this.prisma.mfa_auth.findUnique({ where: { email: email } });
  }
}
