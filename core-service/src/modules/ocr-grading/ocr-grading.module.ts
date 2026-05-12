import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { OcrGradingController } from './ocr-grading.controller';
import { OcrGradingService } from './ocr-grading.service';
import { Test } from '../tests/entities/test.entity';
import { Question } from '../tests/entities/question.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, Question]),
    MulterModule.register({}),
    UsersModule,
  ],
  controllers: [OcrGradingController],
  providers: [OcrGradingService],
})
export class OcrGradingModule {}
