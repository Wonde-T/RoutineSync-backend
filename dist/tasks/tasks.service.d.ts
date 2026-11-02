import { Repository } from 'typeorm';
import { Task } from '../entities';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    findAll(userId: string, query: QueryTasksDto): Promise<Task[]>;
    findOne(userId: string, id: string): Promise<Task>;
    findToday(userId: string, timezone: string): Promise<Task[]>;
    create(userId: string, dto: CreateTaskDto): Promise<Task>;
    update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task>;
    deactivate(userId: string, id: string): Promise<Task>;
}
