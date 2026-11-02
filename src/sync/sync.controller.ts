import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { SyncService } from './sync.service';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch')
  @ApiOperation({
    summary: 'Idempotently sync offline tasks and sessions in bulk',
  })
  syncBatch(@CurrentUser() user: AuthUser, @Body() dto: SyncBatchDto) {
    return this.syncService.syncBatch(user.id, dto);
  }
}
