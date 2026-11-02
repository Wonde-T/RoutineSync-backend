import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AuthUser, JwtPayload } from '../../common/interfaces/auth-user.interface';
import { User } from '../../entities';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersRepository;
    constructor(configService: ConfigService, usersRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<AuthUser>;
}
export {};
