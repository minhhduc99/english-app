import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { StudentStats } from '../entities/student-stats.entity';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StudentStats)
    private readonly statsRepository: Repository<StudentStats>,
  ) {}

  async findAllStudents(): Promise<any[]> {
    const students = await this.userRepository.find({
      where: { role: Role.STUDENT },
      select: ['id', 'username', 'fullName', 'email', 'createdAt'],
      order: { fullName: 'ASC' },
    });

    // Fetch course enrollments via course_students table (which we manage via raw queries)
    const enrollments = await this.userRepository.manager.query(`
      SELECT cs.user_id, c.name 
      FROM course_students cs
      JOIN courses c ON cs.course_id = c.id
      JOIN users u ON cs.user_id = u.id
      WHERE cs.status = 'ACTIVE' AND u.deleted_at IS NULL
    `);

    // We can map these to match the frontend Student type roughly
    return students.map(student => {
      // Find all courses this student is in
      const studentCourses = enrollments
        .filter((e: any) => e.user_id === student.id)
        .map((e: any) => e.name);
        
      return {
        id: student.id,
        studentId: student.username, // Using username as the student ID
        name: student.fullName,
        email: student.email,
        dateOfBirth: 'N/A',
        gender: 'N/A',
        phone: 'N/A',
        class: studentCourses.length > 0 ? studentCourses.join(', ') : 'N/A', // Joining course names
        status: 'Active',
        createdAt: student.createdAt,
      };
    });
  }

  async deleteStudent(id: string): Promise<void> {
    const student = await this.userRepository.findOne({ where: { id, role: Role.STUDENT } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    student.isDeleted = true;
    await this.userRepository.save(student);
    await this.userRepository.softRemove(student);
  }
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    const updated = await this.userRepository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async addRewards(userId: string, xp: number, coins: number, isDaily: boolean = false): Promise<any> {
    let stats = await this.statsRepository.findOne({ where: { user_id: userId } });
    
    if (!stats) {
      stats = this.statsRepository.create({ user_id: userId, xp: 0, coins: 0 });
    }
    
    const oldLevel = Math.floor((stats.xp || 0) / 1000) + 1;
    
    stats.xp = (stats.xp || 0) + xp;
    stats.coins = (stats.coins || 0) + coins;
    
    if (isDaily) {
      stats.lastDailyGameAt = new Date().toISOString().split('T')[0];
    }
    
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    const levelUp = newLevel > oldLevel;
    
    await this.statsRepository.save(stats);

    return {
      totalXp: stats.xp,
      totalCoins: stats.coins,
      currentLevel: newLevel,
      levelUp,
    };
  }
}
