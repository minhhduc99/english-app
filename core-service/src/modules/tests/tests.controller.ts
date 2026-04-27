import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('course-exams/:courseId')
@UseGuards(AuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  create(@Param('courseId') courseId: string, @Body() data: any) {
    return this.testsService.create(courseId, data);
  }

  @Get()
  findAll(@Param('courseId') courseId: string) {
    return this.testsService.findAllByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  update(@Param('id') id: string, @Body() data: any) {
    return this.testsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.testsService.remove(id);
  }
}
