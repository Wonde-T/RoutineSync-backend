import { Task } from './task.entity';
import { TaskSession } from './task-session.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    tasks?: Task[];
    sessions?: TaskSession[];
}
