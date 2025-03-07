import { Injectable } from '@nestjs/common';
import { CreateAccountRequestDto } from './dto/create-account-request.dto';
import { UpdateAccountRequestDto } from './dto/update-account-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { AccountRequestEntity } from './entities/account-request.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VerifyAccountRequestDto } from './dto/verify-account-request.dto';
import {
  AccountRequestNotFoundError,
  InvalidTokenError,
  TokenExpiredError,
} from './errors/account-request-errors';

@Injectable()
export class AccountRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Uses Crypto library to generate a random 64-character hex token.
   * @returns {string}
   */
  async generateToken(): Promise<string> {
    return await crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a new account request and hashes the password and token securely.
   * @param createAccountRequestDto
   * @returns {AccountRequestEntity}
   */
  async create(
    createAccountRequestDto: CreateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    // Secure the passwords and token in database
    const hashedPassword = await argon2.hash(createAccountRequestDto.password);
    createAccountRequestDto.password = hashedPassword;
    const rawRandomToken = await this.generateToken();
    createAccountRequestDto.token = await argon2.hash(rawRandomToken);
    // Set to token and request to expire in 1 hour unless verified.
    createAccountRequestDto.expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const newAccountRequest = await this.prisma.accountRequest.create({
      data: createAccountRequestDto,
    });
    return newAccountRequest;
  }

  /**
   * Verify user's token that was provided by email verification service and create new User if token is successfully verified.
   * Then remove Account Request and return new user entity.
   * @param verifyAccountRequestDto
   * @returns {UserEntity}
   */
  async verifyAccountRequest(
    verifyAccountRequestDto: VerifyAccountRequestDto,
  ): Promise<UserEntity> {
    const accountRequest = await this.prisma.accountRequest.findUnique({
      where: { email: verifyAccountRequestDto.email },
    });

    if (!accountRequest) {
      throw new AccountRequestNotFoundError();
    }

    // Check if the token has expired
    if (new Date() > accountRequest.expiresAt) {
      await this.prisma.accountRequest.delete({
        where: { email: verifyAccountRequestDto.email },
      });
      throw new TokenExpiredError();
    }

    // Verify if the provided token matches the hashed token in the database
    const isTokenValid = await argon2.verify(
      accountRequest.token,
      verifyAccountRequestDto.providedToken,
    );

    if (!isTokenValid) {
      throw new InvalidTokenError();
    }

    // Create a new user using data from the account request
    const newUser = await this.prisma.user.create({
      data: {
        username: accountRequest.username,
        name: accountRequest.name,
        email: accountRequest.email,
        password: accountRequest.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Look up User role
    const userRole = await this.prisma.role.findUnique({
      where: { name: 'User' },
    });

    // Assign new user with User Role.
    await this.prisma.userRoles.create({
      data: {
        userId: newUser.id,
        roleId: userRole.id, // Default to User role.
        assignedBy: newUser.id,
      },
    });

    // Remove Account request
    await this.prisma.accountRequest.delete({
      where: { email: verifyAccountRequestDto.email },
    });

    return newUser;
  }

  /**
   * Find all account requests.
   * @returns {AccountRequestEntity[]}
   */
  async findAll(): Promise<AccountRequestEntity[]> {
    const allAccountRequests = await this.prisma.accountRequest.findMany();
    return allAccountRequests;
  }

  /**
   * Find an account request by Id.
   * @param id
   * @returns {AccountRequestEntity}
   */
  async findOne(id: number): Promise<AccountRequestEntity> {
    const getAccountRequest = await this.prisma.accountRequest.findUnique({
      where: { id: id },
    });
    return getAccountRequest;
  }

  /**
   * Find an account request by email.
   * @param email
   * @returns {AccountRequestEntity}
   */
  async findOneByEmail(email: string): Promise<AccountRequestEntity> {
    const getAccountRequest = await this.prisma.accountRequest.findUnique({
      where: { email: email },
    });
    return getAccountRequest;
  }

  /**
   * Update account request by Id.
   * @param id
   * @param updateAccountRequestDto
   * @returns {AccountRequestEntity}
   */
  async update(
    id: number,
    updateAccountRequestDto: UpdateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    if (updateAccountRequestDto.password) {
      updateAccountRequestDto.password = await argon2.hash(
        updateAccountRequestDto.password,
      );
    }
    const updateAccountRequest = await this.prisma.accountRequest.update({
      where: { id: id },
      data: updateAccountRequestDto,
    });
    return updateAccountRequest;
  }

  /**
   * Remove account request by Id.
   * @param id
   * @returns {AccountRequestEntity}
   */
  async remove(id: number): Promise<AccountRequestEntity> {
    return await this.prisma.accountRequest.delete({ where: { id: id } });
  }
}
