import { Controller, Post, Get, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { TakeAttendanceDto } from './dto/take-attendance.dto';
import { ImportAttendanceDto } from './dto/import-attendance.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('attendance')   // NestJS global prefix 'api' is already set, so full path = /api/attendance
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('take')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async takeAttendance(@Body() dto: TakeAttendanceDto, @Request() req) {
    return this.attendanceService.takeAttendance(dto, req.user.id);
  }

  @Get('export/:classId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async exportTemplate(@Param('classId') classId: string, @Res() res: Response) {
    const workbook = await this.attendanceService.exportTemplate(classId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_template_${classId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }

  @Post('import/:classId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  async importAttendance(
    @Param('classId') classId: string,
    @Body() dto: ImportAttendanceDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.attendanceService.importAttendance(classId, dto.date, file, req.user.id);
  }
  @Get('history/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async getAttendanceHistory(@Param('courseId') courseId: string) {
    return this.attendanceService.getAttendanceHistory(courseId);
  }
}
