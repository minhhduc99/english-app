import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { GamesService } from './games.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('scramble')
  async getScramble(@Query('count') count: number) {
    return this.gamesService.generateScramble(count || 5);
  }

  @Post('scramble/verify')
  async verifyScramble(@Body() body: { id: string; answer: string }) {
    return this.gamesService.verifyScramble(body.id, body.answer);
  }

  @Get('sentence')
  async getSentence(@Query('count') count: number) {
    return this.gamesService.generateSentence(count || 5);
  }

  @Post('sentence/verify')
  async verifySentence(@Body() body: { id: string; answer: string }) {
    return this.gamesService.verifySentence(body.id, body.answer);
  }

  @Get('memory')
  async getMemoryMatch(@Query('count') count: number) {
    return this.gamesService.generateMemoryMatch(count || 6);
  }

  @Get('daily')
  async getDailyChallenge(@Request() req) {
    return this.gamesService.generateDailyChallenge(req.user.id);
  }

  @Post('daily/verify')
  async verifyDailyChallenge(@Request() req, @Body() body: { id: string; answer: string }) {
    return this.gamesService.verifyDailyChallenge(req.user.id, body.id, body.answer);
  }
}
