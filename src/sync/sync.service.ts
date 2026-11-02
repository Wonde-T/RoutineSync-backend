import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { secondsBetween } from '../common/utils/date.util';
import { Task, TaskSession, TimeLog } from '../entities';
import {
  SyncBatchDto,
  SyncSessionDto,
  SyncTaskDto,
} from './dto/sync-batch.dto';

@Injectable()
export class SyncService {
  constructor(private readonly dataSource: DataSource) {}

  async syncBatch(userId: string, dto: SyncBatchDto) {
    return this.dataSource.transaction(async (manager) => {
      const taskMap = new Map<string, Task>();
      let tasksSynced = 0;
      let sessionsSynced = 0;

      for (const taskDto of dto.tasks ?? []) {
        const task = await this.upsertTask(manager, userId, taskDto);
        taskMap.set(taskDto.clientId, task);
        tasksSynced += 1;
      }

      for (const sessionDto of dto.sessions ?? []) {
        let task: Task | null | undefined = taskMap.get(
          sessionDto.taskClientId,
        );

        if (!task) {
          task = await manager.getRepository(Task).findOne({
            where: { userId, clientId: sessionDto.taskClientId },
          });
        }

        if (!task) {
          throw new BadRequestException(
            `Unknown task clientId: ${sessionDto.taskClientId}`,
          );
        }

        await this.upsertSession(manager, userId, task, sessionDto);
        sessionsSynced += 1;
      }

      return {
        tasksSynced,
        sessionsSynced,
        syncedAt: new Date().toISOString(),
      };
    });
  }

  private async upsertTask(
    manager: EntityManager,
    userId: string,
    dto: SyncTaskDto,
  ): Promise<Task> {
    const repository = manager.getRepository(Task);
    let task = await repository.findOne({
      where: { userId, clientId: dto.clientId },
    });

    if (!task) {
      task = repository.create({ userId, clientId: dto.clientId });
    }

    task.title = dto.title.trim();
    task.category = dto.category?.trim() || null;
    task.minimumMinutes = dto.minimumMinutes;
    task.targetDays = [...dto.targetDays].sort((a, b) => a - b);
    task.isActive = dto.isActive ?? true;

    return repository.save(task);
  }

  private async upsertSession(
    manager: EntityManager,
    userId: string,
    task: Task,
    dto: SyncSessionDto,
  ): Promise<TaskSession> {
    const sessions = manager.getRepository(TaskSession);
    const logs = manager.getRepository(TimeLog);

    let session = await sessions.findOne({
      where: { userId, clientId: dto.clientId },
      relations: { timeLogs: true },
    });

    if (!session) {
      session = sessions.create({ userId, clientId: dto.clientId });
    }

    const logEntities = (dto.timeLogs ?? []).map((log) => {
      const startTime = new Date(log.startTime);
      const endTime = log.endTime ? new Date(log.endTime) : null;
      const durationSeconds =
        log.durationSeconds ??
        (endTime ? secondsBetween(startTime, endTime) : null);

      return logs.create({
        clientId: log.clientId ?? null,
        startTime,
        endTime,
        durationSeconds,
      });
    });

    session.taskId = task.id;
    session.date = dto.date;
    session.status = dto.status;
    session.totalTimeTrackedSeconds =
      dto.totalTimeTrackedSeconds ??
      this.totalFromLogs(logEntities) ??
      session.totalTimeTrackedSeconds ??
      0;

    if (session.id && dto.timeLogs) {
      await logs.delete({ sessionId: session.id });
    }

    session.timeLogs = logEntities;

    return sessions.save(session);
  }

  private totalFromLogs(logs: TimeLog[]): number | null {
    if (logs.length === 0) {
      return null;
    }

    return logs.reduce((total, log) => {
      if (log.durationSeconds !== null) {
        return total + log.durationSeconds;
      }

      if (log.endTime) {
        return (
          total + secondsBetween(new Date(log.startTime), new Date(log.endTime))
        );
      }

      return total;
    }, 0);
  }
}
