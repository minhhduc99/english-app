import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { VocabulariesService } from '../vocabularies/vocabularies.service';

@Injectable()
export class AiChatService {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly vocabulariesService: VocabulariesService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async chatWithTutor(message: string, history: any[], language: string = 'en', persona?: string, module?: string) {
    try {
      let systemPrompt = await this.settingsService.getSetting('AI_SYSTEM_PROMPT') || '';
      
      const feedbackRule = `\n\n[CRITICAL FEEDBACK RULE]: You are acting as a strict Vietnamese-speaking AI Tutor. Whenever the user submits a sentence for checking, or asks if a meaning is correct, you MUST begin your response with exactly "Bạn đã đúng." if they are completely right, or exactly "Bạn đã nhầm." if they are wrong. Never use any other introductory phrases to evaluate correctness.`;
      const homeworkRule = `\n\n[ANTI-CHEATING RULE]: You are an AI Tutor, NOT a homework solver. If a student asks you to solve their homework, write an essay for them, or give direct answers to a multiple-choice exercise, you MUST politely refuse. Instead, guide them on how to solve it themselves.`;
      
      systemPrompt = feedbackRule + homeworkRule + '\n\n' + systemPrompt;
      
      const recentVocabs = await this.vocabulariesService.findAll();
      if (recentVocabs && recentVocabs.length > 0) {
        const vocabList = recentVocabs.slice(0, 5).map(v => `${v.word} (${v.definition})`).join(', ');
        const proactiveInstruction = `\n\n[SYSTEM CONTEXT]: The student has recently learned the following vocabularies: [${vocabList}]. Proactively ask the user if they want to practice with this old knowledge.`;
        systemPrompt += proactiveInstruction;
      }
      
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
