import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Test } from './entities/test.entity';
import { Question } from './entities/question.entity';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly dataSource: DataSource,
  ) {}

  async create(courseId: string, data: any) {
    const { questions, ...testData } = data;
    
    const test = this.testRepository.create({
      ...testData,
      courseId,
    });
    
    const savedTest = await this.testRepository.save(test as any) as Test;

    if (questions && questions.length > 0) {
      const questionEntities = questions.map((q: any, index: number) => 
        this.questionRepository.create({
          ...q,
          testId: savedTest.id,
          order: index,
        })
      );
      await this.questionRepository.save(questionEntities);
    }

    return this.findOne(savedTest.id);
  }

  async findAllByCourse(courseId: string) {
    return this.testRepository.find({
      where: { courseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const test = await this.testRepository.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!test) throw new NotFoundException('Test not found');
    
    // Sort questions by order
    if (test.questions) {
      test.questions.sort((a, b) => a.order - b.order);
    }
    
    return test;
  }

  async update(id: string, data: any) {
    const { questions, ...testData } = data;
    await this.testRepository.update(id, testData);

    if (questions) {
      // For simplicity, we'll replace all questions if provided
      await this.questionRepository.delete({ testId: id });
      const questionEntities = questions.map((q: any, index: number) => 
        this.questionRepository.create({
          ...q,
          testId: id,
          order: index,
        })
      );
      await this.questionRepository.save(questionEntities);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.testRepository.softDelete(id);
    return { success: true };
  }
}
