import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('webhooks/ai')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  @Post('sync-complete')
  async handleAISyncComplete(@Body() payload: { lessonId: string, success: boolean }) {
    this.logger.log(`Received Webhook from AI Service for Lesson: ${payload.lessonId}. Success: ${payload.success}`);
    
    // Implementation to update is_synced in MediaAssets table
    // await this.lessonsService.updateSyncStatus(payload.lessonId, payload.success);

    return { received: true };
  }
}
