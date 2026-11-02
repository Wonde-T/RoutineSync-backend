import { TaskSession } from './task-session.entity';
export declare class TimeLog {
    id: string;
    clientId: string | null;
    sessionId: string;
    session: TaskSession;
    startTime: Date;
    endTime: Date | null;
    durationSeconds: number | null;
    createdAt: Date;
    updatedAt: Date;
}
