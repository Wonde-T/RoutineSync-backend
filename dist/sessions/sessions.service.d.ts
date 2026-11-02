import { Repository } from 'typeorm';
import { Task, TaskSession } from '../entities';
import { PauseSessionDto } from './dto/pause-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { StopSessionDto } from './dto/stop-session.dto';
export declare class SessionsService {
    private readonly sessionsRepository;
    private readonly tasksRepository;
    constructor(sessionsRepository: Repository<TaskSession>, tasksRepository: Repository<Task>);
    start(userId: string, dto: StartSessionDto): Promise<TaskSession>;
    pause(userId: string, id: string, dto: PauseSessionDto): Promise<TaskSession>;
    resume(userId: string, id: string, dto: ResumeSessionDto): Promise<TaskSession>;
    stop(userId: string, id: string, dto: StopSessionDto): Promise<TaskSession>;
    findActive(userId: string): Promise<TaskSession | null>;
    findAll(userId: string, query: QuerySessionsDto): Promise<TaskSession[]>;
    findOne(userId: string, id: string): Promise<TaskSession>;
    private closeOpenLogs;
    private calculateTotal;
}
