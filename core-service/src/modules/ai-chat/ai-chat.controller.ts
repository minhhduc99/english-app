import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('ai-chat')
@UseGuards(AuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('tutor')
  async chatWithTutor(
    @Body() body: { message: string; history?: any[]; language?: string },
  ) {
    return this.aiChatService.chatWithTutor(body.message, body.history || [], body.language || 'en');
  }
}
