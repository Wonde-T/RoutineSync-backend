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
import { TaskSessionStatus } from '../common/enums/task-session-status.enum';
import { Task } from './task.entity';
import { TimeLog } from './time-log.entity';
import { User } from './user.entity';

@Entity('task_sessions')
@Index(['userId', 'date'])
@Index(['taskId', 'date'])
export class TaskSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'client_id', type: 'uuid', nullable: true, unique: true })
  clientId!: string | null;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'total_time_tracked_seconds', type: 'int', default: 0 })
  totalTimeTrackedSeconds!: number;

  @Column({
    type: 'enum',
    enum: TaskSessionStatus,
    default: TaskSessionStatus.IN_PROGRESS,
  })
  status!: TaskSessionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => TimeLog, (log) => log.session, { cascade: true })
  timeLogs!: TimeLog[];
}
