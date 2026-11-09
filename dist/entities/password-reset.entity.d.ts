export declare class PasswordReset {
    email: string;
    codeHash: string;
    codeExpiresAt: Date;
    codeSentAt: Date;
    attempts: number;
    tokenHash: string | null;
    tokenExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
