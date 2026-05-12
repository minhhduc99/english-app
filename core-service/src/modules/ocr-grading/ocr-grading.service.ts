import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../tests/entities/test.entity';
import { Question } from '../tests/entities/question.entity';

@Injectable()
export class OcrGradingService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {
    this.aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  async gradeTestScan(testId: string, file: Express.Multer.File): Promise<any> {
    // 1. Load the test with questions to get the correct answers
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['questions'],
    });

    if (!test) {
      throw new NotFoundException(`Test with id "${testId}" not found`);
    }

    if (!test.questions || test.questions.length === 0) {
      throw new NotFoundException('This test has no questions to grade against');
    }

    // Sort questions by order to maintain consistent indexing
    const sortedQuestions = test.questions.sort((a, b) => a.order - b.order);
    const correctAnswers = sortedQuestions.map((q) => q.correctAnswer);

    // 2. Forward the file + answer key to the AI microservice
    const formData = new FormData();

    // Append the file as a Blob
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    formData.append('correct_answers', JSON.stringify(correctAnswers));
    formData.append('total_score', String(test.totalScore));

    try {
      const response = await fetch(
        `${this.aiServiceUrl}/api/v1/ocr/grade-test`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `AI Service responded with ${response.status}: ${errorBody}`,
        );
      }

      const data = await response.json();

      // Enrich the response with question content for display
      return {
        ...data,
        testTitle: test.title,
        passScore: test.passScore,
        isPassed: data.percentage >= test.passScore,
        questions: sortedQuestions.map((q, i) => ({
          id: q.id,
          order: i + 1,
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          studentAnswer: data.student_answers?.[i] ?? -1,
          isCorrect: data.details?.[i]?.is_correct ?? false,
        })),
      };
    } catch (error) {
      console.error('[OcrGradingService] Error calling AI Service:', error);
      throw new InternalServerErrorException(
        'Failed to process OCR grading. Please try again.',
      );
    }
  }
}
