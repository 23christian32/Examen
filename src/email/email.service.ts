import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: envs.SMTP_HOST,
    port: envs.SMTP_PORT,
    secure: envs.SMTP_PORT === 465,
    auth: {
      user: envs.SMTP_USER,
      pass: envs.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  async sendEmail(
    to: string,
    subject: string,
    template: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: envs.SMTP_FROM,
      to,
      subject,
      html: template,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`Correo de prueba enviado. Vista previa: ${previewUrl}`);
    }
  }
}
