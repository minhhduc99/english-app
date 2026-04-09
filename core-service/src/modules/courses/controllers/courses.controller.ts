import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Role } from '../../../common/enums/role.enum';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Create a new course.
   * Access: ADMIN, MANAGER
   */
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Validation failed.' })
  @ApiResponse({ status: 409, description: 'Conflict: Course code already exists.' })
  async create(@Body() dto: CreateCourseDto, @Request() req: any) {
    const createdBy = req.user?.id;
    return this.coursesService.create(dto, createdBy);
  }

  /**
   * Get all courses with optional search query.
   * Access: ADMIN, MANAGER
   */
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List all courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully.' })
  async findAll(@Query('search') search?: string) {
    return this.coursesService.findAll(search);
  }

  @Get('students/available')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all system students' })
  async getAvailableStudents() {
    return this.coursesService.getAvailableStudents();
  }

  @Get(':id/members')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Get assigned students' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getMembers(id);
  }

  @Post(':id/members')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign students to course' })
  async assignStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.coursesService.assignStudents(id, studentIds || []);
  }

  /**
   * Get a single course by ID.
   * Access: ADMIN, MANAGER
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get course details by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  /**
   * Update a course by ID.
   * Access: ADMIN, MANAGER
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, dto);
  }

  /**
   * Delete a course by ID.
   * Access: ADMIN, MANAGER
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.remove(id);
  }
}
