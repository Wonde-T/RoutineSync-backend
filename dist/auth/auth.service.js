"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const mail_service_1 = require("./mail.service");
const BCRYPT_ROUNDS = 12;
const CODE_TTL_MINUTES = 10;
const TOKEN_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const GENERIC_FORGOT_MESSAGE = 'If an account exists for that email, a verification code has been sent.';
let AuthService = AuthService_1 = class AuthService {
    usersRepository;
    resetRepository;
    jwtService;
    mailService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersRepository, resetRepository, jwtService, mailService, configService) {
        this.usersRepository = usersRepository;
        this.resetRepository = resetRepository;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.configService = configService;
    }
    async register(dto) {
        const existing = await this.usersRepository.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const user = this.usersRepository.create({
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
            timezone: dto.timezone ?? 'UTC',
        });
        const saved = await this.usersRepository.save(user);
        return this.buildAuthResponse(saved);
    }
    async login(dto) {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    async forgotPassword(dto) {
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
        if (record &&
            now.getTime() - record.codeSentAt.getTime() < RESEND_COOLDOWN_MS) {
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
            await this.mailService.sendPasswordResetCode(dto.email, code, CODE_TTL_MINUTES);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${dto.email}`, error instanceof Error ? error.stack : undefined);
        }
        return { message: GENERIC_FORGOT_MESSAGE };
    }
    async verifyResetCode(dto) {
        const record = await this.resetRepository.findOne({
            where: { email: dto.email },
        });
        const now = new Date();
        if (!record || record.codeExpiresAt.getTime() < now.getTime()) {
            throw new common_1.BadRequestException('This verification code has expired. Request a new one.');
        }
        if (record.attempts >= MAX_ATTEMPTS) {
            throw new common_1.BadRequestException('Too many incorrect attempts. Request a new code.');
        }
        if (!this.matches(dto.code, record.codeHash)) {
            record.attempts += 1;
            await this.resetRepository.save(record);
            throw new common_1.BadRequestException('Incorrect verification code.');
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        record.tokenHash = this.hash(resetToken);
        record.tokenExpiresAt = new Date(now.getTime() + TOKEN_TTL_MINUTES * 60_000);
        record.codeHash = '';
        record.codeExpiresAt = new Date(0);
        record.attempts = 0;
        await this.resetRepository.save(record);
        return {
            resetToken,
            expiresInSeconds: TOKEN_TTL_MINUTES * 60,
        };
    }
    async resetPassword(dto) {
        const record = await this.resetRepository.findOne({
            where: { email: dto.email },
        });
        const now = new Date();
        const invalid = !record ||
            !record.tokenHash ||
            !record.tokenExpiresAt ||
            record.tokenExpiresAt.getTime() < now.getTime() ||
            !this.matches(dto.resetToken, record.tokenHash);
        if (invalid) {
            throw new common_1.BadRequestException('This reset request is invalid or has expired. Start again.');
        }
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            await this.resetRepository.delete({ email: dto.email });
            throw new common_1.BadRequestException('This reset request is invalid or has expired. Start again.');
        }
        user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const saved = await this.usersRepository.save(user);
        await this.resetRepository.delete({ email: dto.email });
        return this.buildAuthResponse(saved);
    }
    generateCode() {
        return (0, crypto_1.randomInt)(0, 1_000_000).toString().padStart(6, '0');
    }
    hash(value) {
        return (0, crypto_1.createHmac)('sha256', this.configService.getOrThrow('JWT_SECRET'))
            .update(value)
            .digest('hex');
    }
    matches(value, expectedHash) {
        const actual = Buffer.from(this.hash(value), 'hex');
        const expected = Buffer.from(expectedHash, 'hex');
        return (actual.length === expected.length && (0, crypto_1.timingSafeEqual)(actual, expected));
    }
    async buildAuthResponse(user) {
        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: await this.jwtService.signAsync(payload),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.PasswordReset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map