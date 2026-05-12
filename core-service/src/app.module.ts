import { Module } from '@nestjs/common'; // reload trigger
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { UsersModule } from './modules/users/users.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QueueModule } from './modules/queue/queue.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { VocabulariesModule } from './modules/vocabularies/vocabularies.module';
import { GamesModule } from './modules/games/games.module';
import { TestsModule } from './modules/tests/tests.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OcrGradingModule } from './modules/ocr-grading/ocr-grading.module';


@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Polyglot: PostgreSQL Connect
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL', 'postgresql://lms_admin:securepassword123@localhost:5432/lms_db'),
        autoLoadEntities: true,
        synchronize: true, 
      }),
    }),

    // Polyglot: Redis BullMQ Queue Root Config
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // Business Logic Modules
    AuthModule,
    DashboardModule,
    UsersModule,
    AttendanceModule,
    LessonsModule,
    CoursesModule,
    MaterialsModule,
    QueueModule,
    WebhooksModule,
    VocabulariesModule,
    GamesModule,
    TestsModule,
    AiChatModule,
    SettingsModule,
    OcrGradingModule,
  ],
})
export class AppModule {}
