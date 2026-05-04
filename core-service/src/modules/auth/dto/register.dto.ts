import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'The username for the new account' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'securePassword123', description: 'The password for the new account' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email address of the user' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, enumName: 'Role', required: false, default: Role.STUDENT })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

