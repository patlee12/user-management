import { Injectable } from '@nestjs/common';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { generateToken } from 'src/helpers/encryption-tools';
import * as argon2 from 'argon2';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  PasswordResetNotFoundError,
  TokenExpiredError,
  InvalidTokenError,
  UserNotFoundError,
  PasswordResetEmailFailedError,
} from './errors/password-reset-errors';
import { MailingService } from '../mailing/mailing.service';
import { EmailPasswordResetDto } from '../mailing/dto/email-password-reset.dto';
import buildEncodedLink from '@src/helpers/build-encoded-link';
import { FRONTEND_URL } from '@src/common/constants/environment';
import { ValidatePasswordResetDto } from './dto/validate-password-reset.dto';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private mailingService: MailingService,
  ) {}

  /**
   * Create a password reset that will expire in 1 hour.
   * @param createPasswordResetDto
   * @returns {Promise<PasswordResetEntity>}
   */
  async create(
    createPasswordResetDto: CreatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    let user: UserEntity = null;
    if (createPasswordResetDto.userId) {
      const { userId } = createPasswordResetDto;
      // Lookup user email using userId
      user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      const { email } = createPasswordResetDto;
      // Lookup user email using email
      user = await this.prisma.user.findUnique({
        where: { email: email },
      });
    }

    if (!user) {
      throw new UserNotFoundError(`User not found`);
    }

    // Generate the raw token
    const rawRandomToken = await generateToken();

    // Construct the password reset link using the token
    const resetLink = buildEncodedLink(
      `${FRONTEND_URL}/forgot-password/reset`,
      {
        token: rawRandomToken,
        userId: user.id,
      },
    );

    // Send password reset email BEFORE hashing the token
    const emailPasswordResetDto: EmailPasswordResetDto = {
      email: user.email,
      resetLink: resetLink,
    };

    try {
      await this.mailingService.sendPasswordResetEmail(emailPasswordResetDto);
    } catch (error) {
      throw new PasswordResetEmailFailedError(
        'Failed to send password reset email',
      );
    }

    // Hash the token AFTER sending the email
    const hashedToken = await argon2.hash(rawRandomToken);

    // Set token expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save the hashed token and expiration to the database
    const passwordResetData = {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    };

    const createPasswordReset = await this.prisma.passwordReset.create({
      data: passwordResetData,
    });

    return createPasswordReset;
  }

  /**
   * Validate a password reset request by verifying a raw token against the stored hashed token
   * for a given userId. This is used during frontend password reset link validation.
   *
   * NOTE: The stored token is hashed using Argon2, so this method must iterate all active
   * reset tokens for the user and verify each one. This prevents leaking reset state by ID alone.
   *
   * @param userId - The ID of the user requesting the reset
   * @param rawToken - The un-hashed token from the reset link
   * @returns {Promise<PasswordResetEntity>} - The matching reset entity if valid
   * @throws {InvalidTokenError} - If no valid token matches or the token is expired
   */
  async validateResetToken(
    dto: ValidatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        userId: dto.userId,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!reset) {
      throw new InvalidTokenError();
    }

    const isValid = await argon2.verify(reset.token, dto.token);

    if (!isValid) {
      throw new InvalidTokenError();
    }

    return reset;
  }

  /**
   * Confirm a password reset request by verifying the token and updating the user's password.
   * If the token is expired, it will be deleted, and a `TokenExpiredError` will be thrown.
   * If the token is invalid, it will be deleted, and an `InvalidTokenError` will be thrown.
   * If successful, the user's password will be securely updated, and the password reset record will be deleted.
   * @param confirmPasswordResetDto
   * @returns {Promise<UserEntity>} - The updated user entity after password reset.
   */
  async confirmPasswordReset(
    confirmPasswordResetDto: ConfirmPasswordResetDto,
  ): Promise<UserEntity> {
    // Find the password reset request by user ID
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { userId: confirmPasswordResetDto.userId },
    });

    if (!passwordReset) {
      throw new PasswordResetNotFoundError();
    }

    if (new Date() > passwordReset.expiresAt) {
      await this.prisma.passwordReset.delete({
        where: { userId: confirmPasswordResetDto.userId },
      });
      throw new TokenExpiredError();
    }

    // Verify if the provided token matches the stored hashed token
    const isTokenValid = await argon2.verify(
      passwordReset.token,
      confirmPasswordResetDto.token,
    );

    if (!isTokenValid) {
      // Delete the invalid token
      await this.prisma.passwordReset.delete({
        where: { userId: confirmPasswordResetDto.userId },
      });
      throw new InvalidTokenError();
    }

    await this.userService.update(confirmPasswordResetDto.userId, {
      password: confirmPasswordResetDto.newPassword,
    });

    await this.prisma.passwordReset.delete({
      where: { userId: confirmPasswordResetDto.userId },
    });

    const updatedUser = await this.userService.findOne(
      confirmPasswordResetDto.userId,
    );

    return updatedUser;
  }

  /**
   * Find All password resets.
   * @returns {Promise<PasswordResetEntity[]>}
   */
  async findAll(): Promise<PasswordResetEntity[]> {
    return await this.prisma.passwordReset.findMany();
  }

  /**
   * Find one password reset by Id.
   * @param id
   * @returns {Promise<PasswordResetEntity>}
   */
  async findOne(id: number): Promise<PasswordResetEntity> {
    return await this.prisma.passwordReset.findUnique({ where: { id: id } });
  }

  /**
   * Find one password reset by userId.
   * @param userId
   * @returns {Promise<PasswordResetEntity>}
   */
  async findOneByUserId(userId: number): Promise<PasswordResetEntity> {
    return await this.prisma.passwordReset.findUnique({
      where: { userId: userId },
    });
  }

  /**
   * Find a password reset by email.
   * @param email
   * @returns {Promise<PasswordResetEntity>
   */
  async findOneByEmail(email: string): Promise<PasswordResetEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return await this.prisma.passwordReset.findUnique({
      where: { userId: user.id },
    });
  }

  /**
   * Update password reset by Id.
   * @param id
   * @param updatePasswordResetDto
   * @returns {Promise<PasswordResetEntity>}
   */
  async update(
    id: number,
    updatePasswordResetDto: UpdatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    return await this.prisma.passwordReset.update({
      where: { id: id },
      data: updatePasswordResetDto,
    });
  }

  /**
   * Delete a password reset request.
   * @param id
   * @returns {Promise<PasswordResetEntity>}
   */
  async remove(id: number): Promise<PasswordResetEntity> {
    return await this.prisma.passwordReset.delete({ where: { id: id } });
  }
}
