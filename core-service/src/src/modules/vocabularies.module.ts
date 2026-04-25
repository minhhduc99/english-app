import { Module } from '@nestjs/common';
import { VocabulariesController } from './vocabularies/vocabularies.controller';
import { VocabulariesService } from './vocabularies/vocabularies.service';
import { GamesModule } from './games.module';

@Module({
  controllers: [VocabulariesController],
  providers: [VocabulariesService],
  imports: [GamesModule]
})
export class VocabulariesModule {}
