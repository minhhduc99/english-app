import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  status: string; // PRESENT, ABSENT, LATE, EXCUSED
}

export class TakeAttendanceDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
