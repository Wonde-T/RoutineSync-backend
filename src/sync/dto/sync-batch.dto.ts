import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TaskSessionStatus } from '../../common/enums/task-session-status.enum';

export class SyncTaskDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsInt()
  @Min(1)
  @Max(1440)
  minimumMinutes!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  targetDays!: number[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SyncTimeLogDto {
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}

export class SyncSessionDto {
  @IsUUID()
  clientId!: string;

  @IsUUID()
  taskClientId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsEnum(TaskSessionStatus)
  status!: TaskSessionStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalTimeTrackedSeconds?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTimeLogDto)
  timeLogs?: SyncTimeLogDto[];
}

export class SyncBatchDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTaskDto)
  tasks?: SyncTaskDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncSessionDto)
  sessions?: SyncSessionDto[];
}
