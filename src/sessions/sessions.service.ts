import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSessionStatus } from '../common/enums/task-session-status.enum';
import {
  secondsBetween,
  toDateOnly,
} from '../common/utils/date.util';
import { Task, TaskSession, TimeLog } from '../entities';
import { PauseSessionDto } from './dto/pause-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { StopSessionDto } from './dto/stop-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(TaskSession)
    private readonly sessionsRepository: Repository<TaskSession>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async start(userId: string, dto: StartSessionDto): Promise<TaskSession> {
    if (dto.clientId) {
      const existing = await this.sessionsRepository.findOne({
        where: { userId, clientId: dto.clientId },
        relations: { task: true, timeLogs: true },
      });

      if (existing) {
        return existing;
      }
    }

    const task = await this.tasksRepository.findOne({
      where: { id: dto.taskId, userId, isActive: true },
    });

    if (!task) {
      throw new NotFoundException('Active task not found');
    }

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
    const session = this.sessionsRepository.create({
      userId,
      taskId: task.id,
      clientId: dto.clientId ?? null,
      date: dto.date ?? toDateOnly(startedAt),
      status: TaskSessionStatus.IN_PROGRESS,
      totalTimeTrackedSeconds: 0,
      timeLogs: [
        this.sessionsRepository.manager.create(TimeLog, {
          startTime: startedAt,
          endTime: null,
          durationSeconds: null,
        }),
      ],
    });

    return this.sessionsRepository.save(session);
  }

  async pause(
    userId: string,
    id: string,
    dto: PauseSessionDto,
  ): Promise<TaskSession> {
    const session = await this.findOne(userId, id);

    if (session.status === TaskSessionStatus.COMPLETED) {
      throw new BadRequestException('Completed sessions cannot be paused');
    }

    if (session.status === TaskSessionStatus.PAUSED) {
      return session;
    }

    const pausedAt = dto.pausedAt ? new Date(dto.pausedAt) : new Date();
    this.closeOpenLogs(session, pausedAt);
    session.totalTimeTrackedSeconds = this.calculateTotal(session, false);
    session.status = TaskSessionStatus.PAUSED;

    return this.sessionsRepository.save(session);
  }

  async resume(
    userId: string,
    id: string,
    dto: ResumeSessionDto,
  ): Promise<TaskSession> {
    const session = await this.findOne(userId, id);

    if (session.status === TaskSessionStatus.COMPLETED) {
      throw new BadRequestException('Completed sessions cannot be resumed');
    }

    if (session.status === TaskSessionStatus.IN_PROGRESS) {
      return session;
    }

    const resumedAt = dto.resumedAt ? new Date(dto.resumedAt) : new Date();
    session.timeLogs.push(
      this.sessionsRepository.manager.create(TimeLog, {
        sessionId: session.id,
        startTime: resumedAt,
        endTime: null,
        durationSeconds: null,
      }),
    );
    session.status = TaskSessionStatus.IN_PROGRESS;
    session.totalTimeTrackedSeconds = this.calculateTotal(session, false);

    return this.sessionsRepository.save(session);
  }

  async stop(
    userId: string,
    id: string,
    dto: StopSessionDto,
  ): Promise<TaskSession> {
    const session = await this.findOne(userId, id);

    if (session.status === TaskSessionStatus.COMPLETED) {
      return session;
    }

    const endedAt = dto.endedAt ? new Date(dto.endedAt) : new Date();
    this.closeOpenLogs(session, endedAt);
    session.totalTimeTrackedSeconds = this.calculateTotal(session, false);
    session.status = TaskSessionStatus.COMPLETED;

    return this.sessionsRepository.save(session);
  }

  findActive(userId: string): Promise<TaskSession | null> {
    return this.sessionsRepository.findOne({
      where: [
        { userId, status: TaskSessionStatus.IN_PROGRESS },
        { userId, status: TaskSessionStatus.PAUSED },
      ],
      relations: { task: true, timeLogs: true },
      order: { updatedAt: 'DESC' },
    });
  }

  findAll(userId: string, query: QuerySessionsDto): Promise<TaskSession[]> {
    const builder = this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.task', 'task')
      .where('session.user_id = :userId', { userId })
      .orderBy('session.date', 'DESC')
      .addOrderBy('session.created_at', 'DESC');

    if (query.from) {
      builder.andWhere('session.date >= :from', { from: query.from });
    }
    if (query.to) {
      builder.andWhere('session.date <= :to', { to: query.to });
    }
    if (query.taskId) {
      builder.andWhere('session.task_id = :taskId', { taskId: query.taskId });
    }

    return builder.getMany();
  }

  async findOne(userId: string, id: string): Promise<TaskSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id, userId },
      relations: { task: true, timeLogs: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  private closeOpenLogs(session: TaskSession, at: Date): void {
    for (const log of session.timeLogs ?? []) {
      if (log.endTime) {
        continue;
      }

      const start = new Date(log.startTime);
      const endTime = at.getTime() < start.getTime() ? start : at;
      log.endTime = endTime;
      log.durationSeconds = secondsBetween(start, endTime);
    }
  }

  private calculateTotal(session: TaskSession, includeOpen: boolean): number {
    return (session.timeLogs ?? []).reduce((total, log) => {
      if (log.durationSeconds !== null && log.durationSeconds !== undefined) {
        return total + log.durationSeconds;
      }

      if (log.endTime) {
        return total + secondsBetween(new Date(log.startTime), new Date(log.endTime));
      }

      if (includeOpen) {
        return total + secondsBetween(new Date(log.startTime), new Date());
      }

      return total;
    }, 0);
  }
}
