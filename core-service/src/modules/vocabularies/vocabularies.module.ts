import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabulariesService } from './vocabularies.service';
import { VocabulariesController } from './vocabularies.controller';
import { Vocabulary } from './entities/vocabulary.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary]),
    UsersModule, // Required for AuthGuard/RolesGuard to access UserRepository if needed
  ],
  controllers: [VocabulariesController],
  providers: [VocabulariesService],
  exports: [VocabulariesService],
})
export class VocabulariesModule {}
