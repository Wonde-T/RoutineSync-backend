export interface TaskSummaryInput {
  id: string;
  title: string;
  category: string | null;
  minimumMinutes: number;
  targetDays: number[];
  isActive: boolean;
}

export interface SessionSummaryInput {
  taskId: string;
  date: string;
  totalTimeTrackedSeconds: number;
}

export interface WeeklyTotals {
  plannedSeconds: number;
  actualSeconds: number;
  overtimeSeconds: number;
  completionRate: number;
  sessionsCount: number;
  tasksPlanned: number;
}

export interface TaskBreakdown {
  taskId: string;
  title: string;
  category: string | null;
  plannedSeconds: number;
  actualSeconds: number;
  overtimeSeconds: number;
  completionRate: number;
}

export interface DayBreakdown {
  date: string;
  dayNumber: number;
  plannedSeconds: number;
  actualSeconds: number;
  overtimeSeconds: number;
  completionRate: number;
}

export interface CategoryBreakdown {
  category: string;
  plannedSeconds: number;
  actualSeconds: number;
  overtimeSeconds: number;
  completionRate: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totals: WeeklyTotals;
  byTask: TaskBreakdown[];
  byDay: DayBreakdown[];
  byCategory: CategoryBreakdown[];
}

export interface WeeklyReport extends WeeklySummary {
  streakWeeks: number;
}
