"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: Number(process.env.PORT ?? 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'routinesync',
        password: process.env.DB_PASSWORD ?? 'routinesync',
        name: process.env.DB_NAME ?? 'routinesync',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
    },
});
//# sourceMappingURL=configuration.js.map