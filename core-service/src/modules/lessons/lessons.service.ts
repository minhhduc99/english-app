import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectQueue('Process_PDF') private processPdfQueue: Queue,
  ) {}

  async create(courseId: string, title: string, description: string, order: number) {
    const lesson = this.lessonRepository.create({
      courseId,
      title,
      description,
      order,
    });
    return await this.lessonRepository.save(lesson);
  }

  async findAllByCourse(courseId: string) {
    return await this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  async update(id: string, data: Partial<Lesson>) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    Object.assign(lesson, data);
    return await this.lessonRepository.save(lesson);
  }

  async remove(id: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    lesson.isDeleted = true;
    await this.lessonRepository.save(lesson);
    await this.lessonRepository.softRemove(lesson);
    return { message: 'Lesson deleted successfully' };
  }

  async uploadLessonMaterial(lessonId: string, file: Express.Multer.File) {
    this.logger.log(`Uploading file for lesson ${lessonId} to Garage S3...`);
    const s3Path = `lesson-materials/${lessonId}/${file.originalname}`;
    
    await this.processPdfQueue.add('Process_PDF', {
      lessonId,
      s3Path,
      bucket: 'lesson-materials',
      timestamp: Date.now()
    });

    return {
      message: 'Upload successful, AI processing started asynchronously.',
      s3Path
    };
  }
}
