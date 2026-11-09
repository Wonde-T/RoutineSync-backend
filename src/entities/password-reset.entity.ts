import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * One pending password reset challenge per email. The emailed code and the
 * issued reset token are stored as HMAC hashes so a database leak cannot be
 * replayed to take over an account.
 */
@Entity('password_resets')
export class PasswordReset {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 128 })
  codeHash!: string;

  @Column({ name: 'code_expires_at', type: 'timestamptz' })
  codeExpiresAt!: Date;

  @Column({ name: 'code_sent_at', type: 'timestamptz' })
  codeSentAt!: Date;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  tokenHash!: string | null;

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
