import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateMfaDto } from './dto/create-mfa.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UpdateMfaDto } from './dto/update-mfa.dto';
import { encryptSecret } from 'src/helpers/encryption-tools';
import { UserEntity } from './entities/user.entity';
import { MfaAuthEntity } from './entities/mfa-auth.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new user and hashes the password before storing it in database.
   * @param createUserDto
   * @returns {UserEntity}
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
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

    const newUser = await this.prisma.user.create({ data: createUserData });
    return newUser;
  }

  /**
   * Find All Users.
   * @returns {UserEntity[]}
   */
  async findAll(): Promise<UserEntity[]> {
    const allUsers = await this.prisma.user.findMany();
    return allUsers;
  }

  /**
   * Find one user by id.
   * @param id
   * @returns {UserEntity}
   */
  async findOne(id: number): Promise<UserEntity> {
    return await this.prisma.user.findUnique({ where: { id: id } });
  }

  /**
   * Find one User by Email.
   * @param email
   * @returns {UserEntity}
   */
  async findOneByEmail(email: string): Promise<UserEntity> {
    return await this.prisma.user.findUnique({ where: { email: email } });
  }

  /**
   * Update User by id. Also re hash a new password if its provided.
   * @param id
   * @param updateUserDto
   * @returns {UserEntity}
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
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

  /**
   * Remove User by id.
   * @param id
   * @returns {UserEntity}
   */
  async remove(id: number): Promise<UserEntity> {
    return await this.prisma.user.delete({ where: { id: id } });
  }

  /**
   * Create a new MFA auth for the user. A user may only have one MFA auth.
   * @param createMfaDto
   * @returns {MfaAuthEntity}
   */
  async createMfaAuth(createMfaDto: CreateMfaDto): Promise<MfaAuthEntity> {
    const encryptMfaSecret = await encryptSecret(
      createMfaDto.secret,
      process.env.MFA_KEY,
    );
    createMfaDto.secret = encryptMfaSecret;

    return await this.prisma.mfa_auth.create({ data: createMfaDto });
  }

  /**
   * Update MFA auth and if a new secret is included hash it.
   * @param userId
   * @param updateMfaDto
   * @returns {MfaAuthEntity}
   */
  async updateMfaAuth(
    userId: number,
    updateMfaDto: UpdateMfaDto,
  ): Promise<MfaAuthEntity> {
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

  /**
   * Find one MFA auth by user id.
   * @param userId
   * @returns {MfaAuthEntity}
   */
  async findOneMfa(userId: number): Promise<MfaAuthEntity> {
    return await this.prisma.mfa_auth.findUnique({ where: { userId: userId } });
  }

  /**
   * Find one MFA auth by email.
   * @param email
   * @returns {MfaAuthEntity}
   */
  async findOneMfaByEmail(email: string): Promise<MfaAuthEntity> {
    return await this.prisma.mfa_auth.findUnique({ where: { email: email } });
  }
}
