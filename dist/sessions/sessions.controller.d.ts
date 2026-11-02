import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { PauseSessionDto } from './dto/pause-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { StopSessionDto } from './dto/stop-session.dto';
import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    start(user: AuthUser, dto: StartSessionDto): Promise<import("../entities").TaskSession>;
    active(user: AuthUser): Promise<import("../entities").TaskSession | null>;
    findAll(user: AuthUser, query: QuerySessionsDto): Promise<import("../entities").TaskSession[]>;
    findOne(user: AuthUser, id: string): Promise<import("../entities").TaskSession>;
    pause(user: AuthUser, id: string, dto: PauseSessionDto): Promise<import("../entities").TaskSession>;
    resume(user: AuthUser, id: string, dto: ResumeSessionDto): Promise<import("../entities").TaskSession>;
    stop(user: AuthUser, id: string, dto: StopSessionDto): Promise<import("../entities").TaskSession>;
}
