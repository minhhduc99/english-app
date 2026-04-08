import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), UsersModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, TypeOrmModule],
})
export class CoursesModule {}
