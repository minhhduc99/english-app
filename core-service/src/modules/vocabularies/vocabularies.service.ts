import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabulariesService {
  private readonly logger = new Logger(VocabulariesService.name);

  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    return await this.vocabularyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByTopic(topic: string) {
    return await this.vocabularyRepository.find({
      where: { topic },
      order: { createdAt: 'DESC' },
    });
  }

  async findTopics() {
    const query = this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .select('DISTINCT vocabulary.topic', 'topic')
      .where('vocabulary.topic IS NOT NULL');
    const result = await query.getRawMany();
    return result.map(r => r.topic);
  }

  async findByLesson(lessonId: string) {
    return await this.vocabularyRepository.find({
      where: { lessonId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(data: Partial<Vocabulary>) {
    const vocab = this.vocabularyRepository.create(data);
    return await this.vocabularyRepository.save(vocab);
  }

  async update(id: string, data: Partial<Vocabulary>) {
    await this.vocabularyRepository.update(id, data);
    return await this.vocabularyRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const vocab = await this.vocabularyRepository.findOne({ where: { id } });
    if (vocab) {
      vocab.isDeleted = true;
      await this.vocabularyRepository.save(vocab);
      await this.vocabularyRepository.softRemove(vocab);
    }
    return { message: 'Vocabulary deleted successfully' };
  }

  async countAll() {
    return await this.vocabularyRepository.count();
  }

  async syncWithAI() {
    try {
      const vocabularies = await this.findAll();
      const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
      
      const payload = {
        vocabularies: vocabularies.map(v => ({
          word: v.word,
          definition: v.definition,
          example: v.example,
        }))
      };

      const response = await fetch(`${aiServiceUrl}/api/v1/knowledge/train/vocabularies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log(`Successfully synced ${result.count} vocabularies with AI service.`);
      return result;
    } catch (error) {
      this.logger.error('Failed to sync vocabularies with AI service', error);
      throw error;
    }
  }
}
