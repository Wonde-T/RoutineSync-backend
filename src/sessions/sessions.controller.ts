import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { PauseSessionDto } from './dto/pause-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ResumeSessionDto } from './dto/resume-session.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { StopSessionDto } from './dto/stop-session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new tracked session for a task' })
  start(@CurrentUser() user: AuthUser, @Body() dto: StartSessionDto) {
    return this.sessionsService.start(user.id, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Return the latest in-progress or paused session' })
  active(@CurrentUser() user: AuthUser) {
    return this.sessionsService.findActive(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List tracked sessions, optionally by date range' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QuerySessionsDto,
  ) {
    return this.sessionsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one tracked session with its time logs' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.sessionsService.findOne(user.id, id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause the open time log of a session' })
  pause(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: PauseSessionDto,
  ) {
    return this.sessionsService.pause(user.id, id, dto);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused session with a new time log' })
  resume(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ResumeSessionDto,
  ) {
    return this.sessionsService.resume(user.id, id, dto);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop and complete a session' })
  stop(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: StopSessionDto,
  ) {
    return this.sessionsService.stop(user.id, id, dto);
  }
}
