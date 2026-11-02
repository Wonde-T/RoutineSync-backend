import {
  addDays,
  dayNumber,
  endOfWeek,
  weekDays,
} from '../common/utils/date.util';
import {
  CategoryBreakdown,
  DayBreakdown,
  SessionSummaryInput,
  TaskBreakdown,
  TaskSummaryInput,
  WeeklySummary,
} from './weekly-report.types';

const UNCATEGORIZED = 'Uncategorized';

interface TaskDayPlan {
  task: TaskSummaryInput;
  plannedSeconds: number;
  actualSeconds: number;
}

function safeRate(actual: number, planned: number): number {
  if (planned <= 0) {
    return 0;
  }

  return actual / planned;
}

export function buildWeeklySummary(
  tasks: TaskSummaryInput[],
  sessions: SessionSummaryInput[],
  weekStart: string,
): WeeklySummary {
  const weekEnd = endOfWeek(weekStart);
  const days = weekDays(weekStart);
  const hasSessionInWeek = new Set(
    sessions
      .filter((session) => session.date >= weekStart && session.date <= weekEnd)
      .map((session) => session.taskId),
  );
  const relevantTasks = tasks.filter(
    (task) => task.isActive || hasSessionInWeek.has(task.id),
  );

  const sessionsInWeek = sessions.filter(
    (session) => session.date >= weekStart && session.date <= weekEnd,
  );

  const byTask: TaskBreakdown[] = relevantTasks.map((task) => {
    const plannedSeconds =
      task.minimumMinutes * 60 * task.targetDays.length;
    const actualSeconds = sessionsInWeek
      .filter((session) => session.taskId === task.id)
      .reduce((total, session) => total + session.totalTimeTrackedSeconds, 0);
    const overtimeSeconds = sessionsInWeek
      .filter((session) => session.taskId === task.id)
      .reduce((total, session) => {
        const dailyPlan =
          task.targetDays.includes(dayNumber(session.date))
            ? task.minimumMinutes * 60
            : 0;
        return total + Math.max(0, session.totalTimeTrackedSeconds - dailyPlan);
      }, 0);

    return {
      taskId: task.id,
      title: task.title,
      category: task.category,
      plannedSeconds,
      actualSeconds,
      overtimeSeconds,
      completionRate: safeRate(actualSeconds, plannedSeconds),
    };
  });

  const byDay: DayBreakdown[] = days.map((date) => {
    const day = dayNumber(date);
    const plannedSeconds = relevantTasks
      .filter((task) => task.targetDays.includes(day))
      .reduce((total, task) => total + task.minimumMinutes * 60, 0);
    const actualSeconds = sessionsInWeek
      .filter((session) => session.date === date)
      .reduce((total, session) => total + session.totalTimeTrackedSeconds, 0);

    return {
      date,
      dayNumber: day,
      plannedSeconds,
      actualSeconds,
      overtimeSeconds: Math.max(0, actualSeconds - plannedSeconds),
      completionRate: safeRate(actualSeconds, plannedSeconds),
    };
  });

  const byCategoryMap = new Map<string, TaskDayPlan[]>();

  for (const task of relevantTasks) {
    const category = task.category?.trim() || UNCATEGORIZED;
    const entries = byCategoryMap.get(category) ?? [];
    entries.push({
      task,
      plannedSeconds: task.minimumMinutes * 60 * task.targetDays.length,
      actualSeconds: sessionsInWeek
        .filter((session) => session.taskId === task.id)
        .reduce((total, session) => total + session.totalTimeTrackedSeconds, 0),
    });
    byCategoryMap.set(category, entries);
  }

  const byCategory: CategoryBreakdown[] = [...byCategoryMap.entries()]
    .map(([category, entries]) => {
      const plannedSeconds = entries.reduce(
        (total, entry) => total + entry.plannedSeconds,
        0,
      );
      const actualSeconds = entries.reduce(
        (total, entry) => total + entry.actualSeconds,
        0,
      );
      const overtimeSeconds = entries.reduce((total, entry) => {
        const sessionsForTask = sessionsInWeek.filter(
          (session) => session.taskId === entry.task.id,
        );
        const taskOvertime = sessionsForTask.reduce((sum, session) => {
          const dailyPlan = entry.task.targetDays.includes(
            dayNumber(session.date),
          )
            ? entry.task.minimumMinutes * 60
            : 0;
          return sum + Math.max(0, session.totalTimeTrackedSeconds - dailyPlan);
        }, 0);
        return total + taskOvertime;
      }, 0);

      return {
        category,
        plannedSeconds,
        actualSeconds,
        overtimeSeconds,
        completionRate: safeRate(actualSeconds, plannedSeconds),
      };
    })
    .sort((a, b) => b.actualSeconds - a.actualSeconds);

  const plannedSeconds = byTask.reduce(
    (total, task) => total + task.plannedSeconds,
    0,
  );
  const actualSeconds = byTask.reduce(
    (total, task) => total + task.actualSeconds,
    0,
  );

  return {
    weekStart,
    weekEnd,
    totals: {
      plannedSeconds,
      actualSeconds,
      overtimeSeconds: byDay.reduce(
        (total, day) => total + day.overtimeSeconds,
        0,
      ),
      completionRate: safeRate(actualSeconds, plannedSeconds),
      sessionsCount: sessionsInWeek.length,
      tasksPlanned: byTask.filter((task) => task.plannedSeconds > 0).length,
    },
    byTask,
    byDay,
    byCategory,
  };
}

export function calculateStreakWeeks(
  tasks: TaskSummaryInput[],
  sessions: SessionSummaryInput[],
  selectedWeekStart: string,
  currentWeekStart: string,
): number {
  let week = selectedWeekStart;
  const selected = buildWeeklySummary(tasks, sessions, week);

  if (
    week === currentWeekStart &&
    selected.totals.plannedSeconds > 0 &&
    selected.totals.actualSeconds < selected.totals.plannedSeconds
  ) {
    week = addDays(week, -7);
  }

  let streak = 0;

  for (let index = 0; index < 104; index += 1) {
    const summary = buildWeeklySummary(tasks, sessions, week);

    if (
      summary.totals.plannedSeconds <= 0 ||
      summary.totals.actualSeconds < summary.totals.plannedSeconds
    ) {
      break;
    }

    streak += 1;
    week = addDays(week, -7);
  }

  return streak;
}
