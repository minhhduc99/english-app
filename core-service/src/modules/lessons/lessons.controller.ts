import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('lessons')
@UseGuards(AuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async create(
    @Body('courseId') courseId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('order') order: number,
  ) {
    return await this.lessonsService.create(courseId, title, description, order);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER, Role.STUDENT)
  async findAllByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return await this.lessonsService.findAllByCourse(courseId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any,
  ) {
    return await this.lessonsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.lessonsService.remove(id);
  }
}
