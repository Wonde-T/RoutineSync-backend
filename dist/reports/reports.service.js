"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const date_util_1 = require("../common/utils/date.util");
const entities_1 = require("../entities");
const weekly_report_calculator_1 = require("./weekly-report.calculator");
let ReportsService = class ReportsService {
    tasksRepository;
    sessionsRepository;
    constructor(tasksRepository, sessionsRepository) {
        this.tasksRepository = tasksRepository;
        this.sessionsRepository = sessionsRepository;
    }
    async weekly(userId, timezone, requestedWeekStart) {
        const today = (0, date_util_1.todayInTimezone)(timezone);
        const currentWeekStart = (0, date_util_1.startOfWeek)(today);
        const weekStart = (0, date_util_1.startOfWeek)(requestedWeekStart ?? today);
        const weekEnd = (0, date_util_1.addDays)(weekStart, 6);
        const historyStart = (0, date_util_1.addDays)(weekStart, -7 * 103);
        const [tasks, sessions] = await Promise.all([
            this.tasksRepository.find({ where: { userId } }),
            this.sessionsRepository.find({
                where: {
                    userId,
                    date: (0, typeorm_2.Between)(historyStart, weekEnd),
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
        const summary = (0, weekly_report_calculator_1.buildWeeklySummary)(taskInputs, sessionInputs, weekStart);
        const streakWeeks = (0, weekly_report_calculator_1.calculateStreakWeeks)(taskInputs, sessionInputs, weekStart, currentWeekStart);
        return { ...summary, streakWeeks };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TaskSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map