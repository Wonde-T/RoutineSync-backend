export const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addDays(value: string, days: number): string {
  return toDateOnly(new Date(parseDateOnly(value).getTime() + days * DAY_MS));
}

export function startOfWeek(value: string): string {
  const date = parseDateOnly(value);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(value, diff);
}

export function endOfWeek(value: string): string {
  return addDays(startOfWeek(value), 6);
}

export function dayNumber(value: string): number {
  const day = parseDateOnly(value).getUTCDay();
  return day === 0 ? 7 : day;
}

export function todayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return toDateOnly(new Date());
  }
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_value, index) =>
    addDays(weekStart, index),
  );
}

export function secondsBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}
