import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateMfaDto } from './dto/create-mfa.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateMfaDto } from './dto/update-mfa.dto';
import { encryptSecret } from 'src/helpers/encryption-tools';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    const createUserData = {
      ...createUserDto,
      userRoles: {
        create: createUserDto.userRoles?.map((role) => ({
          roleId: role.roleId,
          userId: role.userId,
          assignedBy: role.assignedBy,
        })),
      },
    };

    return this.prisma.user.create({ data: createUserData });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    const updateUserData = {
      ...updateUserDto,
      userRoles: {
        create: updateUserDto.userRoles?.map((role) => ({
          roleId: role.roleId,
          userId: role.userId,
          assignedBy: role.assignedBy,
        })),
      },
    };

    return this.prisma.user.update({ where: { id: id }, data: updateUserData });
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

    this.prisma.mfa_auth.create({ data: createMfaDto });
  }

  async updateMfaAuth(userId: number, updateMfaDto: UpdateMfaDto) {
    if (updateMfaDto.secret) {
      const encrytMfaSecret = await encryptSecret(
        updateMfaDto.secret,
        process.env.MFA_KEY,
      );
      updateMfaDto.secret = encrytMfaSecret;
    }
    this.prisma.mfa_auth.update({
      where: { userId: userId },
      data: updateMfaDto,
    });
  }

  findOneMfa(userId: number) {
    return this.prisma.mfa_auth.findUnique({ where: { userId: userId } });
  }
  findOneMfaByEmail(email: string) {
    return this.prisma.mfa_auth.findUnique({ where: { email: email } });
  }
}
