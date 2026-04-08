import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { CourseLevel } from '../../../common/enums/course-level.enum';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  courseCode!: string;

  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level!: CourseLevel;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  studySchedule!: string;

  @IsInt()
  @Min(1)
  @Max(500)
  maxAttendants!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
