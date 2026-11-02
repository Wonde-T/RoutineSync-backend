import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { WeeklyReportQueryDto } from './dto/weekly-report-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  @ApiOperation({
    summary:
      'Weekly planned vs actual aggregation with overtime, categories and streaks',
  })
  weekly(
    @CurrentUser() user: AuthUser,
    @Query() query: WeeklyReportQueryDto,
  ) {
    return this.reportsService.weekly(
      user.id,
      user.timezone,
      query.weekStart,
    );
  }
}
