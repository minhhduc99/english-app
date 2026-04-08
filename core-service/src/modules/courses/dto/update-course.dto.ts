import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { CourseLevel } from '../../../common/enums/course-level.enum';
import { CourseStatus } from '../../../common/enums/course-status.enum';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  courseCode?: string;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  studySchedule?: string;

  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  maxAttendants?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
