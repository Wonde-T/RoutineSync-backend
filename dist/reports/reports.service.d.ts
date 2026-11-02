import { Repository } from 'typeorm';
import { Task, TaskSession } from '../entities';
import { WeeklyReport } from './weekly-report.types';
export declare class ReportsService {
    private readonly tasksRepository;
    private readonly sessionsRepository;
    constructor(tasksRepository: Repository<Task>, sessionsRepository: Repository<TaskSession>);
    weekly(userId: string, timezone: string, requestedWeekStart?: string): Promise<WeeklyReport>;
}
