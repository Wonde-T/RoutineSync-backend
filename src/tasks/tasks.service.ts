import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { dayNumber, todayInTimezone } from '../common/utils/date.util';
import { Task } from '../entities';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  findAll(userId: string, query: QueryTasksDto): Promise<Task[]> {
    return this.tasksRepository.find({
      where:
        query.active === undefined
          ? { userId }
          : { userId, isActive: query.active },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findToday(userId: string, timezone: string): Promise<Task[]> {
    const today = dayNumber(todayInTimezone(timezone));
    const tasks = await this.tasksRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });

    return tasks.filter((task) => task.targetDays.includes(today));
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    if (dto.clientId) {
      const existing = await this.tasksRepository.findOne({
        where: { userId, clientId: dto.clientId },
      });

      if (existing) {
        return existing;
      }
    }

    const task = this.tasksRepository.create({
      userId,
      clientId: dto.clientId ?? null,
      title: dto.title.trim(),
      category: dto.category?.trim() || null,
      minimumMinutes: dto.minimumMinutes,
      targetDays: [...dto.targetDays].sort((a, b) => a - b),
      isActive: dto.isActive ?? true,
    });

    return this.tasksRepository.save(task);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(userId, id);

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.category !== undefined) {
      task.category = dto.category.trim() || null;
    }
    if (dto.minimumMinutes !== undefined) {
      task.minimumMinutes = dto.minimumMinutes;
    }
    if (dto.targetDays !== undefined) {
      task.targetDays = [...dto.targetDays].sort((a, b) => a - b);
    }
    if (dto.isActive !== undefined) task.isActive = dto.isActive;

    return this.tasksRepository.save(task);
  }

  async deactivate(userId: string, id: string): Promise<Task> {
    const task = await this.findOne(userId, id);
    task.isActive = false;
    return this.tasksRepository.save(task);
  }
}
