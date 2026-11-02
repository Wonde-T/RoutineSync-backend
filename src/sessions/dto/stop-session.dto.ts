import { IsDateString, IsOptional } from 'class-validator';

export class StopSessionDto {
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
