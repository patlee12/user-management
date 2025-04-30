import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { mailConfig } from './mail.config';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { EmailPasswordResetDto } from './dto/email-password-reset.dto';
import { EmailMfaCodeDto } from './dto/email-mfa-code.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailingService {
  private transporter;
  private logger = new Logger(MailingService.name);

  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig);
  }
  /**
   * Loads an HTML email template and dynamically replaces placeholders with actual values.
   * @param templateName - The name of the template file (e.g., 'password-reset.html').
   * @param replacements - A record of key-value pairs where the key is the placeholder in the template
   *                       (e.g., `{{link}}`) and the value is the string to replace it with.
   * @returns The processed HTML content with all placeholders replaced.
   */
  private loadTemplate(
    templateName: string,
    replacements: Record<string, string>,
  ): string {
    try {
      // path relative to current file in both dev and prod
      const filePath = path.join(__dirname, 'templates', templateName);

      if (!fs.existsSync(filePath)) {
        console.error('❌ Template missing:', filePath);
        throw new Error(`Template not found at path: ${filePath}`);
      }

      let template = fs.readFileSync(filePath, 'utf8');

      for (const [key, value] of Object.entries(replacements)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      return template;
    } catch (error: any) {
      console.error(`Failed to load template: ${error.message}`);
      throw new Error(`Failed to load template: ${error.message}`);
    }
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

    const html = await this.loadTemplate('password-reset.html', {
      link: emailPasswordResetDto.resetLink,
      year: new Date().getFullYear().toString(),
      company: 'User-Management',
    });

    return await this.sendEmail(
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

    const html = await this.loadTemplate('email-verification.html', {
      link: emailVerificationDto.verifyLink,
      year: new Date().getFullYear().toString(),
      company: 'User-Management',
    });

    return await this.sendEmail(
      emailVerificationDto.email,
      subject,
      undefined,
      html,
    );
  }

  /**
   * Sends a one-time email MFA code to the specified recipient for login verification.
   * @param emailMfaDto - A data transfer object containing email and code to verify.
   * @returns A promise that resolves when the email is sent successfully.
   */
  async sendEmailMfaCode(emailMfaDto: EmailMfaCodeDto): Promise<void> {
    const subject = 'Your Login Security Code';

    const html = await this.loadTemplate('email-mfa-code.html', {
      code: emailMfaDto.code,
      year: new Date().getFullYear().toString(),
      company: 'User-Management',
    });

    return await this.sendEmail(emailMfaDto.email, subject, undefined, html);
  }
}
