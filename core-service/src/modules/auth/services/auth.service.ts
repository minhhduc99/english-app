import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Standard public self-registration (defaults to STUDENT)
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: registerDto.username }, { email: registerDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const userCount = await this.userRepository.count();
    const assignedRole = userCount === 0 ? Role.ADMIN : Role.STUDENT;

    const newUser = this.userRepository.create({
      ...registerDto,
      role: assignedRole,
    });
    
    await this.userRepository.save(newUser);

    return {
      message: 'Registration successful',
    };
  }

  // Admin-facing method to create any system user or student with a temporary password
  async createManagedUser(registerDto: RegisterDto, role: Role, isTemporary = true) {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: registerDto.username }, { email: registerDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const newUser = this.userRepository.create({
      ...registerDto,
      role: role,
      isTemporaryPassword: isTemporary
    });
    
    await this.userRepository.save(newUser);
    return { 
      message: `${role} account created successfully.`, 
      id: newUser.id 
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });
    
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    
    return {
      message: 'Login successful',
      user: result,
      requiresPasswordChange: user.isTemporaryPassword,
      token: Buffer.from(user.id).toString('base64')
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');

    user.password = dto.newPassword;
    user.isTemporaryPassword = false;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    
    const { password, ...result } = user;
    return result;
  }

  async logout() {
    // In a real app with server-side sessions or token blacklisting, logic would go here.
    return { message: 'Logout successful' };
  }
}
