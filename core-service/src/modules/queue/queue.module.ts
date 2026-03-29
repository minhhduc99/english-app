import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'Process_PDF', // Heavy Document processing queue for the AI microservice
    }),
  ],
  providers: [],
  exports: [BullModule], // Allows other modules to inject the queue
})
export class QueueModule {}
