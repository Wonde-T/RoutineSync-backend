import { Task } from './task.entity';
import { TaskSession } from './task-session.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string | null;
    googleId?: string | null;
    name?: string | null;
    picture?: string | null;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    tasks?: Task[];
    sessions?: TaskSession[];
}
