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
exports.TimeLog = void 0;
const typeorm_1 = require("typeorm");
const task_session_entity_1 = require("./task-session.entity");
let TimeLog = class TimeLog {
    id;
    clientId;
    sessionId;
    session;
    startTime;
    endTime;
    durationSeconds;
    createdAt;
    updatedAt;
};
exports.TimeLog = TimeLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TimeLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id', type: 'uuid', nullable: true, unique: true }),
    __metadata("design:type", Object)
], TimeLog.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id', type: 'uuid' }),
    __metadata("design:type", String)
], TimeLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_session_entity_1.TaskSession, (session) => session.timeLogs, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'session_id' }),
    __metadata("design:type", task_session_entity_1.TaskSession)
], TimeLog.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TimeLog.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TimeLog.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_seconds', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], TimeLog.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TimeLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TimeLog.prototype, "updatedAt", void 0);
exports.TimeLog = TimeLog = __decorate([
    (0, typeorm_1.Entity)('time_logs')
], TimeLog);
//# sourceMappingURL=time-log.entity.js.map