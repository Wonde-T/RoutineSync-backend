import { Transform } from 'class-transformer';
import { IsEmail, Matches, MaxLength } from 'class-validator';

export class VerifyResetCodeDto {
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;
}
