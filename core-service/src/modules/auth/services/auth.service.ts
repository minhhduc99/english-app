import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class AuthService {
  // In-memory array for mocked data, first user is admin as requested.
  private users = [
    {
      id: 1,
      username: 'admin',
      password: 'password123', // In a real app we hash this
      fullName: 'System Administrator',
      email: 'admin@edulms.com',
      role: Role.ADMIN
    }
  ];

  async register(registerDto: RegisterDto) {
    const existingUser = this.users.find(u => u.username === registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const newUser = {
      id: this.users.length + 1,
      ...registerDto,
      role: registerDto.role || Role.STUDENT, // Default fallback
    };
    
    this.users.push(newUser);

    const { password, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = this.users.find(u => u.username === loginDto.username && u.password === loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    
    // In a real application, we would return a JWT token here.
    return {
      message: 'Login successful',
      user: result,
      token: 'mock-jwt-token-12345'
    };
  }

  async getMe(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new UnauthorizedException('User not found');
    
    const { password, ...result } = user;
    return result;
  }
}
