import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('student_stats')
export class StudentStats {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: 0 })
  xp!: number;

  @Column({ default: 0 })
  coins!: number;

  @Column({ type: 'date', nullable: true })
  lastDailyGameAt!: string | null;

  @Column({ default: 0 })
  streakDays!: number;

  @OneToOne(() => User, (user) => user.studentStats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  user_id!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
