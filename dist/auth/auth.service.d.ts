import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { PasswordReset, User } from '../entities';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { MailService } from './mail.service';
export declare class AuthService {
    private readonly usersRepository;
    private readonly resetRepository;
    private readonly jwtService;
    private readonly mailService;
    private readonly configService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, resetRepository: Repository<PasswordReset>, jwtService: JwtService, mailService: MailService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: User;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: User;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetCode(dto: VerifyResetCodeDto): Promise<{
        resetToken: string;
        expiresInSeconds: number;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        accessToken: string;
        user: User;
    }>;
    private generateCode;
    private hash;
    private matches;
    private buildAuthResponse;
}
