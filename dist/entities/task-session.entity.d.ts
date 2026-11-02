import { TaskSessionStatus } from '../common/enums/task-session-status.enum';
import { Task } from './task.entity';
import { TimeLog } from './time-log.entity';
import { User } from './user.entity';
export declare class TaskSession {
    id: string;
    clientId: string | null;
    taskId: string;
    task: Task;
    userId: string;
    user: User;
    date: string;
    totalTimeTrackedSeconds: number;
    status: TaskSessionStatus;
    createdAt: Date;
    updatedAt: Date;
    timeLogs: TimeLog[];
}
