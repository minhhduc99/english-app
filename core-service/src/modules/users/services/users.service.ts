import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { StudentStats } from '../entities/student-stats.entity';
import { Role } from '../../../common/enums/role.enum';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StudentStats)
    private readonly statsRepository: Repository<StudentStats>,
    private readonly notificationsService: NotificationsService,
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
      WHERE cs.status = 'ACTIVE' AND u."deletedAt" IS NULL
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

  async addRewards(userId: string, xp: number, stickers: number, isDaily: boolean = false): Promise<any> {
    let stats = await this.statsRepository.findOne({ where: { user_id: userId } });
    
    if (!stats) {
      stats = this.statsRepository.create({ user_id: userId, xp: 0, stickers: 0 });
    }
    
    const oldLevel = Math.floor((stats.xp || 0) / 1000) + 1;
    
    stats.xp = Math.max(0, (stats.xp || 0) + xp);
    stats.stickers = Math.max(0, (stats.stickers || 0) + stickers);
    
    if (isDaily) {
      stats.lastDailyGameAt = new Date().toISOString().split('T')[0];
    }
    
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    const levelUp = newLevel > oldLevel;
    
    await this.statsRepository.save(stats);

    if (levelUp) {
      await this.notificationsService.create({
        userId,
        title: 'Level Up! 🎉',
        message: `Congratulations! You have reached Level ${newLevel}! Keep up the great work.`,
        type: NotificationType.LEVEL_UP,
      });
    }

    return {
      totalXp: stats.xp,
      totalStickers: stats.stickers,
      currentLevel: newLevel,
      levelUp,
    };
  }
}
