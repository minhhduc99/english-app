import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiChatService {
  private readonly aiServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async chatWithTutor(message: string, history: any[], language: string = 'en') {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/chat/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history, language }),
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
