import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 25, // SMTP port
      secure: false, // Use false for non-SSL (port 25), or true if you are using SSL (port 465 or 587)
      auth: {
        user: 'admin', // Use MAIL_ADMIN_USER for authentication
        pass: 'admin_password', // Use MAIL_ADMIN_PASSWORD
      },
      tls: {
        rejectUnauthorized: false, // For self-signed certs; set to true in production if valid SSL cert is used
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const info = await this.transporter.sendMail({
      from: '"NestJS Mailer" <no-reply@user-management.net>', // Ensure this matches MAIL_DOMAIN
      to, // List of recipients
      subject, // Subject line
      text, // Plain text body
    });
    console.log('Message sent: %s', info.messageId);
  }
}
