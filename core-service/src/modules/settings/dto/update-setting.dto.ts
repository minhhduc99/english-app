import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ description: 'The value to store for this setting key' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
