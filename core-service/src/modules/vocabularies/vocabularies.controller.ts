import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('vocabularies')
@ApiBearerAuth()
@Controller('vocabularies')
@UseGuards(AuthGuard, RolesGuard)
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) { }

  @Get()
  @ApiOperation({ summary: 'Get all vocabularies' })
  @ApiQuery({ name: 'topic', required: false })
  findAll(@Query('topic') topic?: string) {
    if (topic) {
      return this.vocabulariesService.findByTopic(topic);
    }
    return this.vocabulariesService.findAll();
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get all distinct topics' })
  findTopics() {
    return this.vocabulariesService.findTopics();
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get vocabularies by lesson ID' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.vocabulariesService.findByLesson(lessonId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Create new vocabulary - Teacher/Manager/Admin only' })
  create(@Body() data: any) {
    return this.vocabulariesService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Update vocabulary - Teacher/Manager/Admin only' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.vocabulariesService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Delete vocabulary - Teacher/Manager/Admin only' })
  remove(@Param('id') id: string) {
    return this.vocabulariesService.remove(id);
  }

  @Post('sync-ai')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sync all vocabularies with AI Service - Admin only' })
  syncWithAI() {
    return this.vocabulariesService.syncWithAI();
  }
}

