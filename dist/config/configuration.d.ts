export interface AppConfiguration {
    port: number;
    corsOrigin: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        ssl: boolean;
        synchronize: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    mail: {
        host?: string;
        port: number;
        secure: boolean;
        user?: string;
        pass?: string;
        from: string;
    };
}
declare const _default: () => AppConfiguration;
export default _default;
