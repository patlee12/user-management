import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { mailConfig } from './mail.config';

@Injectable()
export class MailService {
  private transporter;
  private logger = new Logger(MailService.name);

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
   * @param to - Recipient's email address.
   * @param resetLink - URL link for resetting the password.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
    <p>You requested to reset your password.</p>
    <a href="${resetLink}">Click here to reset</a>
  `;
    return this.sendEmail(to, subject, undefined, html);
  }

  /**
   * Sends an email verification request to the specified recipient.
   * @param to - Recipient's email address.
   * @param verificationLink - URL link for verifying the email address.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendVerificationEmail(
    to: string,
    verificationLink: string,
  ): Promise<void> {
    const subject = 'Verify Your Email Address';
    const html = `
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;
    return this.sendEmail(to, subject, undefined, html);
  }
}
