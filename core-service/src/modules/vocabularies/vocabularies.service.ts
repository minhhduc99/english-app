import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabulariesService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
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
}
