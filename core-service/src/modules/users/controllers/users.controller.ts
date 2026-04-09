import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('students')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async getStudents() {
    return this.usersService.findAllStudents();
  }

  @Delete('students/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async deleteStudent(@Param('id') id: string) {
    await this.usersService.deleteStudent(id);
    return { message: 'Student deleted successfully' };
  }
}
