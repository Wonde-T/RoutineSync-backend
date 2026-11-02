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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_session_status_enum_1 = require("../common/enums/task-session-status.enum");
const date_util_1 = require("../common/utils/date.util");
const entities_1 = require("../entities");
let SessionsService = class SessionsService {
    sessionsRepository;
    tasksRepository;
    constructor(sessionsRepository, tasksRepository) {
        this.sessionsRepository = sessionsRepository;
        this.tasksRepository = tasksRepository;
    }
    async start(userId, dto) {
        if (dto.clientId) {
            const existing = await this.sessionsRepository.findOne({
                where: { userId, clientId: dto.clientId },
                relations: { task: true, timeLogs: true },
            });
            if (existing) {
                return existing;
            }
        }
        const task = await this.tasksRepository.findOne({
            where: { id: dto.taskId, userId, isActive: true },
        });
        if (!task) {
            throw new common_1.NotFoundException('Active task not found');
        }
        const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
        const session = this.sessionsRepository.create({
            userId,
            taskId: task.id,
            clientId: dto.clientId ?? null,
            date: dto.date ?? (0, date_util_1.toDateOnly)(startedAt),
            status: task_session_status_enum_1.TaskSessionStatus.IN_PROGRESS,
            totalTimeTrackedSeconds: 0,
            timeLogs: [
                this.sessionsRepository.manager.create(entities_1.TimeLog, {
                    startTime: startedAt,
                    endTime: null,
                    durationSeconds: null,
                }),
            ],
        });
        return this.sessionsRepository.save(session);
    }
    async pause(userId, id, dto) {
        const session = await this.findOne(userId, id);
        if (session.status === task_session_status_enum_1.TaskSessionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Completed sessions cannot be paused');
        }
        if (session.status === task_session_status_enum_1.TaskSessionStatus.PAUSED) {
            return session;
        }
        const pausedAt = dto.pausedAt ? new Date(dto.pausedAt) : new Date();
        this.closeOpenLogs(session, pausedAt);
        session.totalTimeTrackedSeconds = this.calculateTotal(session, false);
        session.status = task_session_status_enum_1.TaskSessionStatus.PAUSED;
        return this.sessionsRepository.save(session);
    }
    async resume(userId, id, dto) {
        const session = await this.findOne(userId, id);
        if (session.status === task_session_status_enum_1.TaskSessionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Completed sessions cannot be resumed');
        }
        if (session.status === task_session_status_enum_1.TaskSessionStatus.IN_PROGRESS) {
            return session;
        }
        const resumedAt = dto.resumedAt ? new Date(dto.resumedAt) : new Date();
        session.timeLogs.push(this.sessionsRepository.manager.create(entities_1.TimeLog, {
            sessionId: session.id,
            startTime: resumedAt,
            endTime: null,
            durationSeconds: null,
        }));
        session.status = task_session_status_enum_1.TaskSessionStatus.IN_PROGRESS;
        session.totalTimeTrackedSeconds = this.calculateTotal(session, false);
        return this.sessionsRepository.save(session);
    }
    async stop(userId, id, dto) {
        const session = await this.findOne(userId, id);
        if (session.status === task_session_status_enum_1.TaskSessionStatus.COMPLETED) {
            return session;
        }
        const endedAt = dto.endedAt ? new Date(dto.endedAt) : new Date();
        this.closeOpenLogs(session, endedAt);
        session.totalTimeTrackedSeconds = this.calculateTotal(session, false);
        session.status = task_session_status_enum_1.TaskSessionStatus.COMPLETED;
        return this.sessionsRepository.save(session);
    }
    findActive(userId) {
        return this.sessionsRepository.findOne({
            where: [
                { userId, status: task_session_status_enum_1.TaskSessionStatus.IN_PROGRESS },
                { userId, status: task_session_status_enum_1.TaskSessionStatus.PAUSED },
            ],
            relations: { task: true, timeLogs: true },
            order: { updatedAt: 'DESC' },
        });
    }
    findAll(userId, query) {
        const builder = this.sessionsRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.task', 'task')
            .where('session.user_id = :userId', { userId })
            .orderBy('session.date', 'DESC')
            .addOrderBy('session.created_at', 'DESC');
        if (query.from) {
            builder.andWhere('session.date >= :from', { from: query.from });
        }
        if (query.to) {
            builder.andWhere('session.date <= :to', { to: query.to });
        }
        if (query.taskId) {
            builder.andWhere('session.task_id = :taskId', { taskId: query.taskId });
        }
        return builder.getMany();
    }
    async findOne(userId, id) {
        const session = await this.sessionsRepository.findOne({
            where: { id, userId },
            relations: { task: true, timeLogs: true },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    closeOpenLogs(session, at) {
        for (const log of session.timeLogs ?? []) {
            if (log.endTime) {
                continue;
            }
            const start = new Date(log.startTime);
            const endTime = at.getTime() < start.getTime() ? start : at;
            log.endTime = endTime;
            log.durationSeconds = (0, date_util_1.secondsBetween)(start, endTime);
        }
    }
    calculateTotal(session, includeOpen) {
        return (session.timeLogs ?? []).reduce((total, log) => {
            if (log.durationSeconds !== null && log.durationSeconds !== undefined) {
                return total + log.durationSeconds;
            }
            if (log.endTime) {
                return total + (0, date_util_1.secondsBetween)(new Date(log.startTime), new Date(log.endTime));
            }
            if (includeOpen) {
                return total + (0, date_util_1.secondsBetween)(new Date(log.startTime), new Date());
            }
            return total;
        }, 0);
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.TaskSession)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map