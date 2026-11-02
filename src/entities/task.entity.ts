import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TaskSession } from './task-session.entity';

@Entity('tasks')
@Index(['userId', 'isActive'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true, unique: true })
  clientId!: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 120 })
  title!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  category!: string | null;

  @Column({ name: 'minimum_minutes', type: 'int' })
  minimumMinutes!: number;

  @Column({ name: 'target_days', type: 'int', array: true })
  targetDays!: number[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => TaskSession, (session) => session.task)
  sessions?: TaskSession[];
}
