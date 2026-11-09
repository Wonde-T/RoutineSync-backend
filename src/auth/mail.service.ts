import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Sends transactional email. When SMTP is not configured (local development,
 * CI) the message is written to the server log instead so the reset flow can
 * still be exercised end-to-end.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from =
      this.config.get<string>('mail.from') ??
      'RoutineSync <no-reply@routinesync.app>';

    const host = this.config.get<string>('mail.host');
    if (host) {
      const user = this.config.get<string>('mail.user');
      const pass = this.config.get<string>('mail.pass');
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('mail.port') ?? 587,
        secure: this.config.get<boolean>('mail.secure') ?? false,
        auth: user && pass ? { user, pass } : undefined,
      });
    }
  }

  async sendPasswordResetCode(
    to: string,
    code: string,
    ttlMinutes: number,
  ): Promise<void> {
    const subject = 'Your RoutineSync password reset code';
    const text =
      `Use the verification code below to reset your RoutineSync password.\n\n` +
      `    ${code}\n\n` +
      `This code expires in ${ttlMinutes} minutes. ` +
      `If you did not request a password reset, you can ignore this email.`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin:0 0 12px">Reset your RoutineSync password</h2>
        <p>Use the verification code below to continue:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${code}</p>
        <p style="color:#666">This code expires in ${ttlMinutes} minutes.</p>
        <p style="color:#666">If you did not request a password reset, you can ignore this email.</p>
      </div>`;

    if (!this.transporter) {
      this.logger.warn(
        `SMTP is not configured. Password reset code for ${to} is ${code} ` +
          `(valid for ${ttlMinutes} minutes).`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}
