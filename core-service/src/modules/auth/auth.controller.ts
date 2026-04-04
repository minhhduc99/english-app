import { Controller, Post, Body, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  // Management endpoints
  @Post('system-user')
  async createSystemUser(@Body() registerDto: RegisterDto) {
    // Basic validation: ensure role is provided for system users, fallback to TEACHER
    const role = registerDto.role === Role.ADMIN ? Role.ADMIN : (registerDto.role || Role.TEACHER);
    return this.authService.createManagedUser(registerDto, role, true);
  }

  @Post('student')
  async createStudent(@Body() registerDto: RegisterDto) {
    return this.authService.createManagedUser(registerDto, Role.STUDENT, true);
  }

  // Mocking protected endpoint
  @Get('me')
  async getMe(@Request() req: any) {
    return this.authService.getMe('00000000-0000-0000-0000-000000000000');
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }
}
