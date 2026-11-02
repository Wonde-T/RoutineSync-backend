"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY_MS = void 0;
exports.toDateOnly = toDateOnly;
exports.parseDateOnly = parseDateOnly;
exports.addDays = addDays;
exports.startOfWeek = startOfWeek;
exports.endOfWeek = endOfWeek;
exports.dayNumber = dayNumber;
exports.todayInTimezone = todayInTimezone;
exports.weekDays = weekDays;
exports.secondsBetween = secondsBetween;
exports.DAY_MS = 24 * 60 * 60 * 1000;
function toDateOnly(value) {
    return value.toISOString().slice(0, 10);
}
function parseDateOnly(value) {
    return new Date(`${value}T00:00:00.000Z`);
}
function addDays(value, days) {
    return toDateOnly(new Date(parseDateOnly(value).getTime() + days * exports.DAY_MS));
}
function startOfWeek(value) {
    const date = parseDateOnly(value);
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(value, diff);
}
function endOfWeek(value) {
    return addDays(startOfWeek(value), 6);
}
function dayNumber(value) {
    const day = parseDateOnly(value).getUTCDay();
    return day === 0 ? 7 : day;
}
function todayInTimezone(timezone) {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());
    }
    catch {
        return toDateOnly(new Date());
    }
}
function weekDays(weekStart) {
    return Array.from({ length: 7 }, (_value, index) => addDays(weekStart, index));
}
function secondsBetween(start, end) {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}
//# sourceMappingURL=date.util.js.map