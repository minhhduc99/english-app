import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Test } from './test.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  testId: string;

  @ManyToOne(() => Test, (test) => test.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: Test;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column({ type: 'int' })
  correctAnswer: number; // Index of the correct option

  @Column({ type: 'int', default: 0 })
  order: number;
}
