import { DataSource } from 'typeorm';
import { SyncBatchDto } from './dto/sync-batch.dto';
export declare class SyncService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    syncBatch(userId: string, dto: SyncBatchDto): Promise<{
        tasksSynced: number;
        sessionsSynced: number;
        syncedAt: string;
    }>;
    private upsertTask;
    private upsertSession;
    private totalFromLogs;
}
