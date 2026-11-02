import {
  IsDateString,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  taskId!: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
