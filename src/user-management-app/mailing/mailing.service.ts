import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { mailConfig } from './mail.config';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { EmailPasswordResetDto } from './dto/email-password-reset.dto';

@Injectable()
export class MailingService {
  private transporter;
  private logger = new Logger(MailingService.name);

  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  /**
   * Sends an email with the specified subject and content.
   * Supports both plain text and HTML content.
   * @param to - Recipient's email address.
   * @param subject - Subject of the email.
   * @param text - Plain text content of the email (optional).
   * @param html - HTML content of the email (optional).
   */
  async sendEmail(
    to: string,
    subject: string,
    text?: string,
    html?: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: mailConfig.auth.user,
        to,
        subject,
        text,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);
      throw error;
    }
  }

  /**
   * Sends a password reset email to the specified recipient.
   * @param emailPasswordResetDto - A data transfer object containing email and resetLink.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendPasswordResetEmail(
    emailPasswordResetDto: EmailPasswordResetDto,
  ): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
    <p>You requested to reset your password.</p>
    <a href="${emailPasswordResetDto.resetLink}">Click here to reset</a>
  `;
    return this.sendEmail(
      emailPasswordResetDto.email,
      subject,
      undefined,
      html,
    );
  }

  /**
   * Sends an email verification request to the specified recipient.
   * @param emailVerificationDto - A data transfer object containing email and verification link.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendVerificationEmail(
    emailVerificationDto: EmailVerificationDto,
  ): Promise<void> {
    const subject = 'Verify Your Email Address';
    const html = `
    <p>Click the link below to verify your email:</p>
    <a href="${emailVerificationDto.verifyLink}">Verify Email</a>
  `;
    return this.sendEmail(emailVerificationDto.email, subject, undefined, html);
  }
}
