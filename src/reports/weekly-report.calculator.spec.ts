import {
  buildWeeklySummary,
  calculateStreakWeeks,
} from './weekly-report.calculator';
import { SessionSummaryInput, TaskSummaryInput } from './weekly-report.types';

const task: TaskSummaryInput = {
  id: 'task-1',
  title: 'Read',
  category: 'Academics',
  minimumMinutes: 30,
  targetDays: [1, 3],
  isActive: true,
};

describe('weekly report calculator', () => {
  it('aggregates planned, actual and overtime per task and day', () => {
    const sessions: SessionSummaryInput[] = [
      { taskId: 'task-1', date: '2026-10-26', totalTimeTrackedSeconds: 2400 },
      { taskId: 'task-1', date: '2026-10-28', totalTimeTrackedSeconds: 900 },
    ];

    const report = buildWeeklySummary([task], sessions, '2026-10-26');

    expect(report.weekEnd).toBe('2026-11-01');
    expect(report.totals.plannedSeconds).toBe(3600);
    expect(report.totals.actualSeconds).toBe(3300);
    expect(report.totals.overtimeSeconds).toBe(600);
    expect(report.byTask[0].completionRate).toBeCloseTo(3300 / 3600);
    expect(report.byDay[0].actualSeconds).toBe(2400);
    expect(report.byDay[2].actualSeconds).toBe(900);
    expect(report.byCategory[0].category).toBe('Academics');
  });

  it('counts consecutive weeks that meet the minimum target', () => {
    const sessions: SessionSummaryInput[] = [
      { taskId: 'task-1', date: '2026-10-26', totalTimeTrackedSeconds: 3600 },
      { taskId: 'task-1', date: '2026-10-28', totalTimeTrackedSeconds: 3600 },
      { taskId: 'task-1', date: '2026-10-19', totalTimeTrackedSeconds: 3600 },
      { taskId: 'task-1', date: '2026-10-21', totalTimeTrackedSeconds: 3600 },
    ];

    const streak = calculateStreakWeeks(
      [task],
      sessions,
      '2026-10-26',
      '2026-11-02',
    );

    expect(streak).toBe(2);
  });

  it('starts streak from the previous week when the current week is incomplete', () => {
    const sessions: SessionSummaryInput[] = [
      { taskId: 'task-1', date: '2026-10-26', totalTimeTrackedSeconds: 3600 },
      { taskId: 'task-1', date: '2026-10-28', totalTimeTrackedSeconds: 3600 },
      { taskId: 'task-1', date: '2026-11-02', totalTimeTrackedSeconds: 600 },
    ];

    const streak = calculateStreakWeeks(
      [task],
      sessions,
      '2026-11-02',
      '2026-11-02',
    );

    expect(streak).toBe(1);
  });
});
