import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { VocabulariesService } from './vocabularies.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('vocabularies')
@ApiBearerAuth()
@Controller('vocabularies')
@UseGuards(AuthGuard, RolesGuard)
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vocabularies' })
  findAll() {
    return this.vocabulariesService.findAll();
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
}

