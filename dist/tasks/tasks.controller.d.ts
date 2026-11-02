import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(user: AuthUser, query: QueryTasksDto): Promise<import("../entities").Task[]>;
    findToday(user: AuthUser): Promise<import("../entities").Task[]>;
    findOne(user: AuthUser, id: string): Promise<import("../entities").Task>;
    create(user: AuthUser, dto: CreateTaskDto): Promise<import("../entities").Task>;
    update(user: AuthUser, id: string, dto: UpdateTaskDto): Promise<import("../entities").Task>;
    deactivate(user: AuthUser, id: string): Promise<import("../entities").Task>;
}
