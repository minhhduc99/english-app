import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  lessonId: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  word: string;

  @Column({ nullable: true })
  ipa: string;

  @Column('text')
  definition: string;

  @Column({ nullable: true })
  example: string;

  @CreateDateColumn()
  createdAt: Date;
}
