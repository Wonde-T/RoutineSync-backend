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
exports.TaskSession = void 0;
const typeorm_1 = require("typeorm");
const task_session_status_enum_1 = require("../common/enums/task-session-status.enum");
const task_entity_1 = require("./task.entity");
const time_log_entity_1 = require("./time-log.entity");
const user_entity_1 = require("./user.entity");
let TaskSession = class TaskSession {
    id;
    clientId;
    taskId;
    task;
    userId;
    user;
    date;
    totalTimeTrackedSeconds;
    status;
    createdAt;
    updatedAt;
    timeLogs;
};
exports.TaskSession = TaskSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'uuid', nullable: true, unique: true }),
    __metadata("design:type", Object)
], TaskSession.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id', type: 'uuid' }),
    __metadata("design:type", String)
], TaskSession.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.sessions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskSession.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], TaskSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sessions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TaskSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], TaskSession.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_time_tracked_seconds', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TaskSession.prototype, "totalTimeTrackedSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: task_session_status_enum_1.TaskSessionStatus,
        default: task_session_status_enum_1.TaskSessionStatus.IN_PROGRESS,
    }),
    __metadata("design:type", String)
], TaskSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskSession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => time_log_entity_1.TimeLog, (log) => log.session, { cascade: true }),
    __metadata("design:type", Array)
], TaskSession.prototype, "timeLogs", void 0);
exports.TaskSession = TaskSession = __decorate([
    (0, typeorm_1.Entity)('task_sessions'),
    (0, typeorm_1.Index)(['userId', 'date']),
    (0, typeorm_1.Index)(['taskId', 'date'])
], TaskSession);
//# sourceMappingURL=task-session.entity.js.map