import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  // Inject the Redis Queue from BullMQ
  constructor(@InjectQueue('Process_PDF') private processPdfQueue: Queue) {}

  async uploadLessonMaterial(lessonId: string, file: Express.Multer.File) {
    this.logger.log(`Uploading file for lesson ${lessonId} to Garage S3...`);
    
    // 1. Garage S3 Upload Logic here using AWS SDK v3...
    const s3Path = `lesson-materials/${lessonId}/${file.originalname}`;
    
    // 2. Add job to Redis queue for the AI Service to process (OCR/RAG/Embedding)
    this.logger.log(`Pushing async document processing to Redis Queue...`);
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
