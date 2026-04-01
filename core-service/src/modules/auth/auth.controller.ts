import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../../../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Injecting ADMIN role if not provided for first user workflow
    return this.authService.register({ ...registerDto, role: Role.ADMIN });
  }

  // Mocking protected endpoint
  @Get('me')
  async getMe(@Request() req: any) {
    // Assume user id 1 is passed by headers or token in realistic scenario. Here we mock returning Admin.
    return this.authService.getMe(1);
  }
}
