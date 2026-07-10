import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  async getForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { isRead: 'ASC', createdAt: 'DESC' },
      take: 50, // Get the latest 50 notifications
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    
    if (notification && !notification.isRead) {
      notification.isRead = true;
      return this.notificationRepository.save(notification);
    }
    return notification;
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);
    return this.notificationRepository.save(notification);
  }

  async broadcastToClass(dto: BroadcastNotificationDto): Promise<void> {
    this.logger.log(`Broadcasting notification to class ${dto.courseId}`);
    
    // Ensure the course_students table exists and query students
    try {
      const students = await this.dataSource.query(`
        SELECT cs.user_id AS id
        FROM course_students cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.course_id = $1 AND cs.status = 'ACTIVE' AND u."deletedAt" IS NULL
      `, [dto.courseId]);

      if (students.length > 0) {
        const notifications = students.map(student => {
          return this.notificationRepository.create({
            userId: student.id,
            title: dto.title,
            message: dto.message,
            type: NotificationType.CLASS,
          });
        });
        
        await this.notificationRepository.save(notifications);
        this.logger.log(`Created ${notifications.length} notifications for class ${dto.courseId}`);
      }
    } catch (error) {
      this.logger.error(`Error broadcasting to class: ${error.message}`);
    }
  }
}
