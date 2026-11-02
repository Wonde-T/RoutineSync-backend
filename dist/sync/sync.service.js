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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const date_util_1 = require("../common/utils/date.util");
const entities_1 = require("../entities");
let SyncService = class SyncService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async syncBatch(userId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const taskMap = new Map();
            let tasksSynced = 0;
            let sessionsSynced = 0;
            for (const taskDto of dto.tasks ?? []) {
                const task = await this.upsertTask(manager, userId, taskDto);
                taskMap.set(taskDto.clientId, task);
                tasksSynced += 1;
            }
            for (const sessionDto of dto.sessions ?? []) {
                let task = taskMap.get(sessionDto.taskClientId);
                if (!task) {
                    task = await manager.getRepository(entities_1.Task).findOne({
                        where: { userId, clientId: sessionDto.taskClientId },
                    });
                }
                if (!task) {
                    throw new common_1.BadRequestException(`Unknown task clientId: ${sessionDto.taskClientId}`);
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
    async upsertTask(manager, userId, dto) {
        const repository = manager.getRepository(entities_1.Task);
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
    async upsertSession(manager, userId, task, dto) {
        const sessions = manager.getRepository(entities_1.TaskSession);
        const logs = manager.getRepository(entities_1.TimeLog);
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
            const durationSeconds = log.durationSeconds ??
                (endTime ? (0, date_util_1.secondsBetween)(startTime, endTime) : null);
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
    totalFromLogs(logs) {
        if (logs.length === 0) {
            return null;
        }
        return logs.reduce((total, log) => {
            if (log.durationSeconds !== null) {
                return total + log.durationSeconds;
            }
            if (log.endTime) {
                return (total + (0, date_util_1.secondsBetween)(new Date(log.startTime), new Date(log.endTime)));
            }
            return total;
        }, 0);
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SyncService);
//# sourceMappingURL=sync.service.js.map