import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as exceljs from 'exceljs';
import { TakeAttendanceDto } from './dto/take-attendance.dto';

const ENSURE_COURSE_ATTENDANCE_TABLE = `
  CREATE TABLE IF NOT EXISTS course_attendance (
    id          BIGSERIAL,
    student_id  UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    status      VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
  )
`;

const ENSURE_COURSE_STUDENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS course_students (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (course_id, user_id)
  )
`;

@Injectable()
export class AttendanceService {
  constructor(private readonly dataSource: DataSource) {}

  async takeAttendance(dto: TakeAttendanceDto, userId: string) {
    const { classId: courseId, date, records } = dto;

    // Ensure tables exist
    await this.dataSource.query(ENSURE_COURSE_ATTENDANCE_TABLE);
    await this.dataSource.query(ENSURE_COURSE_STUDENTS_TABLE);

    // Validate the course exists (not the legacy classes table)
    const courseCheck = await this.dataSource.query(
      'SELECT id FROM courses WHERE id = $1 AND deleted_at IS NULL',
      [courseId],
    );
    if (courseCheck.length === 0) {
      throw new NotFoundException('Course not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const record of records) {
        // Check if attendance already exists for this student in this course on this date
        const existing = await queryRunner.query(
          'SELECT id, status FROM course_attendance WHERE student_id = $1 AND course_id = $2 AND date = $3',
          [record.studentId, courseId, date],
        );

        if (existing.length > 0) {
          const att = existing[0];
          if (att.status !== record.status) {
            await queryRunner.query(
              'UPDATE course_attendance SET status = $1 WHERE id = $2',
              [record.status, att.id],
            );
          }
        } else {
          await queryRunner.query(
            'INSERT INTO course_attendance (student_id, course_id, date, status) VALUES ($1, $2, $3, $4)',
            [record.studentId, courseId, date, record.status],
          );
        }
      }
      await queryRunner.commitTransaction();
      return { message: 'Attendance recorded successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to record attendance: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async exportTemplate(courseId: string): Promise<exceljs.Workbook> {
    await this.dataSource.query(ENSURE_COURSE_STUDENTS_TABLE);

    const members = await this.dataSource.query(
      `SELECT cs.user_id AS student_id, u."fullName" AS full_name
       FROM course_students cs
       JOIN users u ON cs.user_id = u.id
       WHERE cs.course_id = $1 AND cs.status = 'ACTIVE' AND u.deleted_at IS NULL
       ORDER BY u."fullName"`,
      [courseId],
    );

    if (members.length === 0) {
      throw new NotFoundException('No active students enrolled in this course. Assign students first.');
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'Student ID', key: 'student_id', width: 40 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
    ];

    (worksheet as any).dataValidations.add('C2:C1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['"PRESENT,ABSENT,LATE,EXCUSED"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Status',
      error: 'Please select a valid status from the dropdown',
    });

    for (const member of members) {
      worksheet.addRow({
        student_id: member.student_id,
        full_name: member.full_name,
        status: 'PRESENT',
      });
    }

    return workbook;
  }

  async importAttendance(courseId: string, date: string, file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Worksheet not found in Excel file');
    }

    const records: { studentId: string; status: string }[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const studentId = row.getCell(1).value?.toString();
        const status = row.getCell(3).value?.toString()?.toUpperCase() || 'PRESENT';
        if (studentId) {
          records.push({ studentId, status });
        }
      }
    });

    if (records.length === 0) {
      throw new BadRequestException('No attendance records found in file');
    }

    const dto = new TakeAttendanceDto();
    dto.classId = courseId;
    dto.date = date;
    dto.records = records;

    return this.takeAttendance(dto, userId);
  }
  async getAttendanceHistory(courseId: string) {
    // Return all distinct dates formatted safely as strings
    const datesRes = await this.dataSource.query(`
      SELECT DISTINCT TO_CHAR(date, 'YYYY-MM-DD') as date 
      FROM course_attendance 
      WHERE course_id = $1 
      ORDER BY TO_CHAR(date, 'YYYY-MM-DD') ASC
    `, [courseId]);
    const dates = datesRes.map((d: any) => d.date);

    // Return students and their attendance
    const records = await this.dataSource.query(`
      SELECT TO_CHAR(ca.date, 'YYYY-MM-DD') as date, ca.status, u.id as student_id, u."fullName" as full_name
      FROM course_attendance ca
      JOIN users u ON ca.student_id = u.id
      WHERE ca.course_id = $1 AND u.deleted_at IS NULL
    `, [courseId]);

    const studentMap = new Map();
    for (const r of records) {
      if (!studentMap.has(r.student_id)) {
        studentMap.set(r.student_id, {
          studentId: r.student_id,
          fullName: r.full_name,
          attendance: {}
        });
      }
      studentMap.get(r.student_id).attendance[r.date] = r.status;
    }

    return {
      dates,
      students: Array.from(studentMap.values())
    };
  }
}
