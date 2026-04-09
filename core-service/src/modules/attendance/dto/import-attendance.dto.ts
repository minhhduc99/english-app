import { IsDateString, IsNotEmpty } from 'class-validator';

export class ImportAttendanceDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
