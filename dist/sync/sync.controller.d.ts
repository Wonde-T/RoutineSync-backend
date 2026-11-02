import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { SyncService } from './sync.service';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    syncBatch(user: AuthUser, dto: SyncBatchDto): Promise<{
        tasksSynced: number;
        sessionsSynced: number;
        syncedAt: string;
    }>;
}
