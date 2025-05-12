import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountRequestDto } from './dto/create-account-request.dto';
import { UpdateAccountRequestDto } from './dto/update-account-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { AccountRequestEntity } from './entities/account-request.entity';
import { UserEntity } from '../users/entities/user.entity';
import { VerifyAccountRequestDto } from './dto/verify-account-request.dto';
import {
  AccountRequestNotFoundError,
  InvalidTokenError,
  TokenExpiredError,
  VerificationEmailFailed,
} from './errors/account-request-errors';
import { generateToken } from 'src/helpers/encryption-tools';
import { MailingService } from '../mailing/mailing.service';
import { EmailVerificationDto } from '../mailing/dto/email-verification.dto';
import buildEncodedLink from '@src/helpers/build-encoded-link';
import { FRONTEND_URL } from '@src/common/constants/environment';

@Injectable()
export class AccountRequestsService {
  constructor(
    private prisma: PrismaService,
    private readonly mailingService: MailingService,
  ) {}

  /**
   * Creates a new account request for user registration.
   *
   * This method performs the following:
   * 1. Cleans up any expired account requests from the database.
   * 2. Validates that the requested email and username are not already in use by a user or pending request.
   * 3. Hashes the user's password and generates a secure verification token.
   * 4. Stores the token (hashed) along with a short `tokenId` used for lookup.
   * 5. Sends a verification email to the user with the raw token.
   *
   * @param createAccountRequestDto - The user's requested registration data (email, username, password, etc.)
   * @returns The saved account request entity.
   * @throws ConflictException if the email or username is already in use.
   * @throws VerificationEmailFailed if sending the email fails.
   */
  async create(
    createAccountRequestDto: CreateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    const { email, username } = createAccountRequestDto;

    // Step 1: Cleanup expired requests
    await this.prisma.accountRequest.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Step 2: Check for existing users or pending requests
    const [
      existingUserByEmail,
      existingUserByUsername,
      existingAccountRequestEmail,
      existingAccountRequestUsername,
    ] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { username } }),
      this.prisma.accountRequest.findUnique({ where: { email } }),
      this.prisma.accountRequest.findUnique({ where: { username } }),
    ]);

    if (existingUserByEmail || existingAccountRequestEmail) {
      console.warn('[create] Email already in use');
      throw new ConflictException('Email is already in use');
    }

    if (existingUserByUsername || existingAccountRequestUsername) {
      console.warn('[create] Username already in use');
      throw new ConflictException('Username is already in use');
    }

    // Step 3: Hash password and generate token
    const hashedPassword = await argon2.hash(createAccountRequestDto.password);
    const rawToken = await generateToken();
    const tokenId = rawToken.slice(0, 16);
    const hashedToken = await argon2.hash(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Step 4: Create DB record
    const newAccountRequest = await this.prisma.accountRequest.create({
      data: {
        ...createAccountRequestDto,
        password: hashedPassword,
        token: hashedToken,
        tokenId,
        expiresAt,
      },
    });

    // Step 5: Send verification email
    const verificationLink = buildEncodedLink(
      `${FRONTEND_URL}/auth/verify-email`,
      {
        tokenId: tokenId,
        token: rawToken,
      },
    );

    const emailVerificationDto: EmailVerificationDto = {
      email,
      verifyLink: verificationLink,
    };

    try {
      await this.mailingService.sendVerificationEmail(emailVerificationDto);
    } catch (error) {
      console.error('[create] Failed to send verification email:', error);
      throw new VerificationEmailFailed();
    }

    return newAccountRequest;
  }

  /**
   * Verifies a new account request using the tokenId and the provided token.
   *
   * ### Process:
   * 1. Looks up the account request using the `tokenId`.
   * 2. If not found, throws `AccountRequestNotFoundError`.
   * 3. If the request is expired, deletes it and throws `TokenExpiredError`.
   * 4. Verifies the provided token against the stored hashed token using Argon2.
   *    - If invalid, deletes the account request and throws `InvalidTokenError`.
   * 5. Creates a new `User` and `Profile` with the verified request data.
   * 6. Assigns the default "User" role to the new account via `UserRoles`.
   * 7. Deletes the original `AccountRequest` after successful user creation.
   *
   * @param dto - Data Transfer Object containing `tokenId` and `providedToken`.
   * @returns A newly created `UserEntity` if the token is valid.
   * @throws `AccountRequestNotFoundError` if no matching request is found.
   * @throws `TokenExpiredError` if the request has expired.
   * @throws `InvalidTokenError` if the token hash comparison fails (and the request is removed).
   */
  async verifyAccountRequest(
    dto: VerifyAccountRequestDto,
  ): Promise<UserEntity> {
    const accountRequest = await this.prisma.accountRequest.findUnique({
      where: { tokenId: dto.tokenId },
    });

    if (!accountRequest) {
      throw new AccountRequestNotFoundError();
    }

    if (new Date() > accountRequest.expiresAt) {
      await this.prisma.accountRequest.delete({
        where: { id: accountRequest.id },
      });
      throw new TokenExpiredError();
    }

    const isValid = await argon2.verify(
      accountRequest.token,
      dto.providedToken,
    );

    if (!isValid) {
      await this.prisma.accountRequest.delete({
        where: { id: accountRequest.id },
      });
      throw new InvalidTokenError();
    }

    const newUser = await this.prisma.user.create({
      data: {
        username: accountRequest.username,
        name: accountRequest.name,
        email: accountRequest.email,
        emailVerified: true,
        password: accountRequest.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.prisma.profile.create({
      data: {
        userId: newUser.id,
        name: accountRequest.name || accountRequest.username,
      },
    });

    const role = await this.prisma.role.findUnique({ where: { name: 'User' } });
    if (role) {
      await this.prisma.userRoles.create({
        data: {
          userId: newUser.id,
          roleId: role.id,
          assignedBy: newUser.id,
        },
      });
    }

    await this.prisma.accountRequest.delete({
      where: { id: accountRequest.id },
    });

    return newUser;
  }

  async findAll(): Promise<AccountRequestEntity[]> {
    const allAccountRequests = await this.prisma.accountRequest.findMany();
    return allAccountRequests;
  }

  async findOne(id: number): Promise<AccountRequestEntity> {
    return await this.prisma.accountRequest.findUnique({
      where: { id },
    });
  }

  async findOneByEmail(email: string): Promise<AccountRequestEntity> {
    return await this.prisma.accountRequest.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    updateAccountRequestDto: UpdateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    if (updateAccountRequestDto.password) {
      updateAccountRequestDto.password = await argon2.hash(
        updateAccountRequestDto.password,
      );
    }

    return await this.prisma.accountRequest.update({
      where: { id },
      data: updateAccountRequestDto,
    });
  }

  async remove(id: number): Promise<AccountRequestEntity> {
    return await this.prisma.accountRequest.delete({ where: { id } });
  }
}
