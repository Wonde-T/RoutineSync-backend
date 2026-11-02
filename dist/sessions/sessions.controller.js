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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const pause_session_dto_1 = require("./dto/pause-session.dto");
const query_sessions_dto_1 = require("./dto/query-sessions.dto");
const resume_session_dto_1 = require("./dto/resume-session.dto");
const start_session_dto_1 = require("./dto/start-session.dto");
const stop_session_dto_1 = require("./dto/stop-session.dto");
const sessions_service_1 = require("./sessions.service");
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    start(user, dto) {
        return this.sessionsService.start(user.id, dto);
    }
    active(user) {
        return this.sessionsService.findActive(user.id);
    }
    findAll(user, query) {
        return this.sessionsService.findAll(user.id, query);
    }
    findOne(user, id) {
        return this.sessionsService.findOne(user.id, id);
    }
    pause(user, id, dto) {
        return this.sessionsService.pause(user.id, id, dto);
    }
    resume(user, id, dto) {
        return this.sessionsService.resume(user.id, id, dto);
    }
    stop(user, id, dto) {
        return this.sessionsService.stop(user.id, id, dto);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new tracked session for a task' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_session_dto_1.StartSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Return the latest in-progress or paused session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "active", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tracked sessions, optionally by date range' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_sessions_dto_1.QuerySessionsDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one tracked session with its time logs' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, swagger_1.ApiOperation)({ summary: 'Pause the open time log of a session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, pause_session_dto_1.PauseSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Resume a paused session with a new time log' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, resume_session_dto_1.ResumeSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop and complete a session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, stop_session_dto_1.StopSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "stop", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map