import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly config;
    private readonly logger;
    private readonly transporter?;
    private readonly from;
    constructor(config: ConfigService);
    sendPasswordResetCode(to: string, code: string, ttlMinutes: number): Promise<void>;
}
