import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { VocabulariesModule } from '../vocabularies/vocabularies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [VocabulariesModule, UsersModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
