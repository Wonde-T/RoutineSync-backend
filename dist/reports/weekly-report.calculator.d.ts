import { SessionSummaryInput, TaskSummaryInput, WeeklySummary } from './weekly-report.types';
export declare function buildWeeklySummary(tasks: TaskSummaryInput[], sessions: SessionSummaryInput[], weekStart: string): WeeklySummary;
export declare function calculateStreakWeeks(tasks: TaskSummaryInput[], sessions: SessionSummaryInput[], selectedWeekStart: string, currentWeekStart: string): number;
