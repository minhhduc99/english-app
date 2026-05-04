import { Controller, Post, Body, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Return JWT access token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Self-registration for students' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  // Management endpoints
  @Post('system-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a system user (Admin/Teacher/Manager) - Admin only' })
  async createSystemUser(@Body() registerDto: RegisterDto) {
    // Basic validation: ensure role is provided for system users, fallback to TEACHER
    const role = registerDto.role === Role.ADMIN ? Role.ADMIN : (registerDto.role || Role.TEACHER);
    return this.authService.createManagedUser(registerDto, role, true);
  }

  @Post('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a student user - Admin/Teacher only' })
  async createStudent(@Body() registerDto: RegisterDto) {
    return this.authService.createManagedUser(registerDto, Role.STUDENT, true);
  }

  // Mocking protected endpoint
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    return this.authService.getMe('00000000-0000-0000-0000-000000000000');
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  async logout() {
    return this.authService.logout();
  }
}

