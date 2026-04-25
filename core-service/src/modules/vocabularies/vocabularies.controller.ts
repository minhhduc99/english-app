import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('vocabularies')
@UseGuards(AuthGuard, RolesGuard)
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}

  @Get()
  findAll() {
    return this.vocabulariesService.findAll();
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.vocabulariesService.findByLesson(lessonId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Body() data: any) {
    return this.vocabulariesService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() data: any) {
    return this.vocabulariesService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.vocabulariesService.remove(id);
  }
}
