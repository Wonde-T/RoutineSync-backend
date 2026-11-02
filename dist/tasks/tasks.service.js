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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const date_util_1 = require("../common/utils/date.util");
const entities_1 = require("../entities");
let TasksService = class TasksService {
    tasksRepository;
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    findAll(userId, query) {
        return this.tasksRepository.find({
            where: query.active === undefined
                ? { userId }
                : { userId, isActive: query.active },
            order: { createdAt: 'ASC' },
        });
    }
    async findOne(userId, id) {
        const task = await this.tasksRepository.findOne({
            where: { id, userId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async findToday(userId, timezone) {
        const today = (0, date_util_1.dayNumber)((0, date_util_1.todayInTimezone)(timezone));
        const tasks = await this.tasksRepository.find({
            where: { userId, isActive: true },
            order: { createdAt: 'ASC' },
        });
        return tasks.filter((task) => task.targetDays.includes(today));
    }
    async create(userId, dto) {
        if (dto.clientId) {
            const existing = await this.tasksRepository.findOne({
                where: { userId, clientId: dto.clientId },
            });
            if (existing) {
                return existing;
            }
        }
        const task = this.tasksRepository.create({
            userId,
            clientId: dto.clientId ?? null,
            title: dto.title.trim(),
            category: dto.category?.trim() || null,
            minimumMinutes: dto.minimumMinutes,
            targetDays: [...dto.targetDays].sort((a, b) => a - b),
            isActive: dto.isActive ?? true,
        });
        return this.tasksRepository.save(task);
    }
    async update(userId, id, dto) {
        const task = await this.findOne(userId, id);
        if (dto.title !== undefined)
            task.title = dto.title.trim();
        if (dto.category !== undefined) {
            task.category = dto.category.trim() || null;
        }
        if (dto.minimumMinutes !== undefined) {
            task.minimumMinutes = dto.minimumMinutes;
        }
        if (dto.targetDays !== undefined) {
            task.targetDays = [...dto.targetDays].sort((a, b) => a - b);
        }
        if (dto.isActive !== undefined)
            task.isActive = dto.isActive;
        return this.tasksRepository.save(task);
    }
    async deactivate(userId, id) {
        const task = await this.findOne(userId, id);
        task.isActive = false;
        return this.tasksRepository.save(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map