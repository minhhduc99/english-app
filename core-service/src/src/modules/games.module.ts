import { Module } from '@nestjs/common';
import { GamesController } from './games/games.controller';
import { GamesService } from './games/games.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService]
})
export class GamesModule {}
