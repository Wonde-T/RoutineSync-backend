import { TaskSessionStatus } from '../../common/enums/task-session-status.enum';
export declare class SyncTaskDto {
    clientId: string;
    title: string;
    category?: string;
    minimumMinutes: number;
    targetDays: number[];
    isActive?: boolean;
}
export declare class SyncTimeLogDto {
    clientId?: string;
    startTime: string;
    endTime?: string;
    durationSeconds?: number;
}
export declare class SyncSessionDto {
    clientId: string;
    taskClientId: string;
    date: string;
    status: TaskSessionStatus;
    totalTimeTrackedSeconds?: number;
    timeLogs?: SyncTimeLogDto[];
}
export declare class SyncBatchDto {
    tasks?: SyncTaskDto[];
    sessions?: SyncSessionDto[];
}
