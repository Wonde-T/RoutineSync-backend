import { IsDateString, IsOptional } from 'class-validator';

export class PauseSessionDto {
  @IsOptional()
  @IsDateString()
  pausedAt?: string;
}
