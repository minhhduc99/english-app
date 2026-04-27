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
    return await this.lessonRepository.manager.query(`
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM vocabularies v WHERE v."lessonId" = l.id AND v."isDeleted" = false) as "vocabularyCount",
        (SELECT COUNT(*) FROM materials m WHERE m."lessonId" = l.id AND m."isDeleted" = false) as "materialCount"
      FROM lessons l
      WHERE l."courseId" = $1 AND l."isDeleted" = false
      ORDER BY l."order" ASC
    `, [courseId]);
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

  async getLessonContent(lessonId: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Fetch vocabularies (assuming we can use raw query or inject repository)
    const vocabularies = await this.lessonRepository.manager.query(`
      SELECT * FROM vocabularies WHERE "lessonId" = $1 AND "isDeleted" = false
    `, [lessonId]);

    // Fetch materials
    const materials = await this.lessonRepository.manager.query(`
      SELECT * FROM materials WHERE "lessonId" = $1 AND "isDeleted" = false
    `, [lessonId]);

    return {
      lesson,
      vocabularies,
      materials
    };
  }

  async linkMaterials(lessonId: string, materialIds: string[]) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.lessonRepository.manager.query(`
      UPDATE materials SET "lessonId" = $1 WHERE id = ANY($2)
    `, [lessonId, materialIds]);

    return { message: 'Materials linked to lesson successfully' };
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
