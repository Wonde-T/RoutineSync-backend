import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  addDays,
  startOfWeek,
  todayInTimezone,
} from '../common/utils/date.util';
import { Task, TaskSession } from '../entities';
import {
  calculateStreakWeeks,
  buildWeeklySummary,
} from './weekly-report.calculator';
import { WeeklyReport } from './weekly-report.types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskSession)
    private readonly sessionsRepository: Repository<TaskSession>,
  ) {}

  async weekly(
    userId: string,
    timezone: string,
    requestedWeekStart?: string,
  ): Promise<WeeklyReport> {
    const today = todayInTimezone(timezone);
    const currentWeekStart = startOfWeek(today);
    const weekStart = startOfWeek(requestedWeekStart ?? today);
    const weekEnd = addDays(weekStart, 6);
    const historyStart = addDays(weekStart, -7 * 103);

    const [tasks, sessions] = await Promise.all([
      this.tasksRepository.find({ where: { userId } }),
      this.sessionsRepository.find({
        where: {
          userId,
          date: Between(historyStart, weekEnd),
        },
      }),
    ]);

    const taskInputs = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      category: task.category,
      minimumMinutes: task.minimumMinutes,
      targetDays: task.targetDays,
      isActive: task.isActive,
    }));
    const sessionInputs = sessions.map((session) => ({
      taskId: session.taskId,
      date: session.date,
      totalTimeTrackedSeconds: session.totalTimeTrackedSeconds,
    }));

    const summary = buildWeeklySummary(taskInputs, sessionInputs, weekStart);
    const streakWeeks = calculateStreakWeeks(
      taskInputs,
      sessionInputs,
      weekStart,
      currentWeekStart,
    );

    return { ...summary, streakWeeks };
  }
}
