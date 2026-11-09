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
exports.PasswordReset = void 0;
const typeorm_1 = require("typeorm");
let PasswordReset = class PasswordReset {
    email;
    codeHash;
    codeExpiresAt;
    codeSentAt;
    attempts;
    tokenHash;
    tokenExpiresAt;
    createdAt;
    updatedAt;
};
exports.PasswordReset = PasswordReset;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PasswordReset.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_hash', type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], PasswordReset.prototype, "codeHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PasswordReset.prototype, "codeExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code_sent_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PasswordReset.prototype, "codeSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PasswordReset.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'token_hash',
        type: 'varchar',
        length: 128,
        nullable: true,
    }),
    __metadata("design:type", Object)
], PasswordReset.prototype, "tokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_expires_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], PasswordReset.prototype, "tokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PasswordReset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PasswordReset.prototype, "updatedAt", void 0);
exports.PasswordReset = PasswordReset = __decorate([
    (0, typeorm_1.Entity)('password_resets')
], PasswordReset);
//# sourceMappingURL=password-reset.entity.js.map