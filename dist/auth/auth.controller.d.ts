import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: import("../entities").User;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: import("../entities").User;
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
        user: import("../entities").User;
    }>;
    me(user: AuthUser): Promise<import("../entities").User>;
}
