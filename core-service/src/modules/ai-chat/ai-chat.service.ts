import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AiChatService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async chatWithTutor(message: string, history: any[], language: string = 'en', persona?: string, module?: string) {
    try {
      const systemPrompt = await this.settingsService.getSetting('AI_SYSTEM_PROMPT');
      
      const response = await fetch(`${this.aiServiceUrl}/api/v1/chat/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history, language, system_prompt: systemPrompt || undefined, persona, module }),
      });

      if (!response.ok) {
        throw new Error(`AI Service responded with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error communicating with AI Service:', error);
      throw new InternalServerErrorException('Failed to communicate with AI Tutor');
    }
  }
}
