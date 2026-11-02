import { IsDateString, IsOptional } from 'class-validator';

export class ResumeSessionDto {
  @IsOptional()
  @IsDateString()
  resumedAt?: string;
}
