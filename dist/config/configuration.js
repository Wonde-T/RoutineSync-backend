"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db']);
function cleanHost(value) {
    if (!value) {
        return undefined;
    }
    const withoutQuery = value.split('?')[0].trim();
    return withoutQuery.length > 0 ? withoutQuery : undefined;
}
exports.default = () => {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    const parsedUrl = databaseUrl ? new URL(databaseUrl) : undefined;
    const host = parsedUrl?.hostname ?? cleanHost(process.env.DB_HOST) ?? 'localhost';
    const port = parsedUrl?.port
        ? Number(parsedUrl.port)
        : Number(process.env.DB_PORT ?? 5432);
    const username = parsedUrl
        ? decodeURIComponent(parsedUrl.username)
        : (process.env.DB_USERNAME ?? 'routinesync');
    const password = parsedUrl
        ? decodeURIComponent(parsedUrl.password)
        : (process.env.DB_PASSWORD ?? 'routinesync');
    const name = parsedUrl
        ? parsedUrl.pathname.replace(/^\//, '')
        : (process.env.DB_NAME ?? 'routinesync');
    const sslMode = parsedUrl?.searchParams.get('sslmode');
    const ssl = process.env.DB_SSL !== undefined
        ? process.env.DB_SSL === 'true'
        : sslMode
            ? sslMode !== 'disable'
            : !LOCAL_HOSTS.has(host);
    return {
        port: Number(process.env.PORT ?? 3000),
        corsOrigin: process.env.CORS_ORIGIN ?? '*',
        database: {
            host,
            port,
            username,
            password,
            name,
            ssl,
            synchronize: process.env.DB_SYNCHRONIZE === 'true',
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
        },
        mail: {
            host: cleanHost(process.env.SMTP_HOST),
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER?.trim() || undefined,
            pass: process.env.SMTP_PASS?.trim() || undefined,
            from: process.env.MAIL_FROM?.trim() ||
                'RoutineSync <no-reply@routinesync.app>',
        },
    };
};
//# sourceMappingURL=configuration.js.map