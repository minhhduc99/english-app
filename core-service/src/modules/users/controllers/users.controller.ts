import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'List all students' })
  async getStudents() {
    return this.usersService.findAllStudents();
  }

  @Delete('students/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a student account - Admin/Manager only' })
  async deleteStudent(@Param('id') id: string) {
    await this.usersService.deleteStudent(id);
    return { message: 'Student deleted successfully' };
  }
}

