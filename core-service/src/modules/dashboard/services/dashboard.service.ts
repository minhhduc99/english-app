import { Injectable, Logger } from '@nestjs/common';
import { MaterialsService } from '../../materials/materials.service';
import { VocabulariesService } from '../../vocabularies/vocabularies.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly materialsService: MaterialsService,
    private readonly vocabulariesService: VocabulariesService,
  ) {}

  /**
   * Fetches the core overview statistics for the administrative dashboard.
   * 
   * Provides counts for:
   * 1. Students (Current system growth)
   * 2. Courses (Curriculum status)
   * 3. Attendance Rate (Student engagement)
   * 4. Finished Courses (Academic success)
   */
  async getOverview() {
    this.logger.log('Fetching Admin Dashboard Overview Statistics');

    // In a real implementation, we would query the database using TypeORM
    // e.g., await this.usersRepository.count({ where: { role: Role.STUDENT } });
    
    return {
      stats: [
        { label: "Total Students", value: "1,234", icon: "Users", color: "blue" },
        { label: "Total Courses", value: "48", icon: "BookOpen", color: "green" },
        { label: "Attendance Rate", value: "94%", icon: "TrendingUp", color: "purple" },
        { label: "Course Finished", value: "12", icon: "Award", color: "orange" },
      ],
      recentActivity: [
        { id: 1, type: "STUDENT_ENROLLED", message: "New student enrolled", timestamp: "2 hours ago" },
        { id: 2, type: "COURSE_CREATED", message: "Curriculum: IELTS Foundation updated", timestamp: "4 hours ago" },
        { id: 3, type: "SYSTEM_ALERT", message: "Daily backup completed successfully", timestamp: "8 hours ago" },
        { id: 4, type: "USER_FEEDBACK", message: "New inquiry from contact page", timestamp: "1 day ago" },
      ]
    };
  }

  async getTeacherStats(teacherId: string) {
    this.logger.log(`Fetching Teacher Dashboard Statistics for user: ${teacherId}`);
    
    const materialCounts = await this.materialsService.countByTeacher(teacherId);
    const globalCounts = await this.materialsService.countAll();
    const vocabCount = await this.vocabulariesService.countAll();
    
    return {
      materials: {
        total: materialCounts.total,
        thisMonth: materialCounts.thisMonth,
        types: materialCounts.types,
        categories: materialCounts.categories,
      },
      global: {
        flashcards: vocabCount,
        games: globalCounts.categories.find(c => c.category === 'GAME')?.count || 0,
      }
    };
  }
}
