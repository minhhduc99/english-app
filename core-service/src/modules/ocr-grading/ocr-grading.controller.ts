import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrGradingService } from './ocr-grading.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { memoryStorage } from 'multer';

@Controller('course-exams/:courseId')
@UseGuards(AuthGuard, RolesGuard)
export class OcrGradingController {
  constructor(private readonly ocrGradingService: OcrGradingService) {}

  /**
   * POST /api/course-exams/:courseId/:testId/grade-scan
   * Upload a student's answer sheet PDF or image to auto-grade via OCR + AI.
   * Access: ADMIN, TEACHER
   */
  @Post(':testId/grade-scan')
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/bmp',
          'image/tiff',
          'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only PDF, JPG, PNG, WEBP, BMP, or TIFF files are accepted',
            ),
            false,
          );
        }
      },
    }),
  )
  async gradeScan(
    @Param('testId') testId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.ocrGradingService.gradeTestScan(testId, file);
  }
}
