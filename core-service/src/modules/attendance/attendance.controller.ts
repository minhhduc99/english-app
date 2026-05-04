import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { TakeAttendanceDto } from './dto/take-attendance.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('take')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Record attendance for a course' })
  async takeAttendance(@Body() dto: TakeAttendanceDto, @Request() req: any) {
    return this.attendanceService.takeAttendance(dto, req.user.id);
  }

  @Get('export/:classId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Download attendance Excel template' })
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
  @ApiOperation({ summary: 'Import attendance from Excel file' })
  async importAttendance(
    @Param('classId') classId: string,
    @Body('date') date: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.attendanceService.importAttendance(classId, date, file, req.user.id);
  }

  @Get('history/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Get attendance history for a course' })
  async getAttendanceHistory(@Param('courseId') courseId: string) {
    return this.attendanceService.getAttendanceHistory(courseId);
  }

  @Get('report/:courseId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @ApiOperation({ summary: 'Export monthly attendance report for a course' })
  @ApiQuery({ name: 'month', type: Number, example: 5 })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  async exportReport(
    @Param('courseId') courseId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const workbook = await this.attendanceService.generateMonthlyReport(
      courseId,
      parseInt(month, 10),
      parseInt(year, 10),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${courseId}_${month}_${year}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }
}

