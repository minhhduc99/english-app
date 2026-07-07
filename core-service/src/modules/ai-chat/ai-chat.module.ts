import { Module } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { UsersModule } from '../users/users.module';
import { SettingsModule } from '../settings/settings.module';
import { VocabulariesModule } from '../vocabularies/vocabularies.module';

@Module({
  imports: [UsersModule, SettingsModule, VocabulariesModule],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
