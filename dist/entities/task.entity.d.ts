import { User } from './user.entity';
import { TaskSession } from './task-session.entity';
export declare class Task {
    id: string;
    clientId: string | null;
    userId: string;
    user: User;
    title: string;
    category: string | null;
    minimumMinutes: number;
    targetDays: number[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    sessions?: TaskSession[];
}
