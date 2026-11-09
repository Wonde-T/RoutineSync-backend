import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { JwtPayload } from '../common/interfaces/auth-user.interface';
import { PasswordReset, User } from '../entities';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { MailService } from './mail.service';

const BCRYPT_ROUNDS = 12;
const CODE_TTL_MINUTES = 10;
const TOKEN_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

const GENERIC_FORGOT_MESSAGE =
  'If an account exists for that email, a verification code has been sent.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PasswordReset)
    private readonly resetRepository: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      timezone: dto.timezone ?? 'UTC',
    });

    const saved = await this.usersRepository.save(user);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Start a password reset. The response is intentionally identical whether or
   * not the email is registered so the endpoint cannot be used to enumerate
   * accounts.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      return { message: GENERIC_FORGOT_MESSAGE };
    }

    const now = new Date();
    let record = await this.resetRepository.findOne({
      where: { email: dto.email },
    });

    // Throttle repeated requests without revealing anything to the caller.
    if (
      record &&
      now.getTime() - record.codeSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return { message: GENERIC_FORGOT_MESSAGE };
    }

    const code = this.generateCode();
    record ??= this.resetRepository.create({ email: dto.email });
    record.codeHash = this.hash(code);
    record.codeExpiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60_000);
    record.codeSentAt = now;
    record.attempts = 0;
    record.tokenHash = null;
    record.tokenExpiresAt = null;
    await this.resetRepository.save(record);

    try {
      await this.mailService.sendPasswordResetCode(
        dto.email,
        code,
        CODE_TTL_MINUTES,
      );
    } catch (error) {
      // Keep the endpoint response uniform; the operator sees the failure in
      // the logs and the code remains valid for a retry.
      this.logger.error(
        `Failed to send password reset email to ${dto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { message: GENERIC_FORGOT_MESSAGE };
  }

  /** Verify the emailed code and exchange it for a short-lived reset token. */
  async verifyResetCode(dto: VerifyResetCodeDto) {
    const record = await this.resetRepository.findOne({
      where: { email: dto.email },
    });
    const now = new Date();

    if (!record || record.codeExpiresAt.getTime() < now.getTime()) {
      throw new BadRequestException(
        'This verification code has expired. Request a new one.',
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code.',
      );
    }

    if (!this.matches(dto.code, record.codeHash)) {
      record.attempts += 1;
      await this.resetRepository.save(record);
      throw new BadRequestException('Incorrect verification code.');
    }

    const resetToken = randomBytes(32).toString('hex');
    record.tokenHash = this.hash(resetToken);
    record.tokenExpiresAt = new Date(
      now.getTime() + TOKEN_TTL_MINUTES * 60_000,
    );
    // Consume the code so it cannot be verified twice.
    record.codeHash = '';
    record.codeExpiresAt = new Date(0);
    record.attempts = 0;
    await this.resetRepository.save(record);

    return {
      resetToken,
      expiresInSeconds: TOKEN_TTL_MINUTES * 60,
    };
  }

  /** Set a new password using a verified reset token, then log the user in. */
  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.resetRepository.findOne({
      where: { email: dto.email },
    });
    const now = new Date();

    const invalid =
      !record ||
      !record.tokenHash ||
      !record.tokenExpiresAt ||
      record.tokenExpiresAt.getTime() < now.getTime() ||
      !this.matches(dto.resetToken, record.tokenHash);

    if (invalid) {
      throw new BadRequestException(
        'This reset request is invalid or has expired. Start again.',
      );
    }

    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      await this.resetRepository.delete({ email: dto.email });
      throw new BadRequestException(
        'This reset request is invalid or has expired. Start again.',
      );
    }

    user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const saved = await this.usersRepository.save(user);
    await this.resetRepository.delete({ email: dto.email });

    return this.buildAuthResponse(saved);
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private hash(value: string): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>('JWT_SECRET'),
    )
      .update(value)
      .digest('hex');
  }

  private matches(value: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hash(value), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private async buildAuthResponse(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
