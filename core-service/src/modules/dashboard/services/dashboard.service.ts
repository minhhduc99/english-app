import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Role } from '../../../common/enums/role.enum';
import { CourseStatus } from '../../../common/enums/course-status.enum';
import { MaterialsService } from '../../materials/materials.service';
import { VocabulariesService } from '../../vocabularies/vocabularies.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
    private readonly materialsService: MaterialsService,
    private readonly vocabulariesService: VocabulariesService,
  ) {}

  /**
   * Fetches the core overview statistics for the manager dashboard.
   */
  async getOverview() {
    this.logger.log('Fetching Dashboard Overview Statistics');

    // Counts
    const totalStudents = await this.userRepository.count({ 
      where: { role: Role.STUDENT } 
    });

    const totalCourses = await this.courseRepository.count();
    
    const totalFinished = await this.courseRepository.count({
      where: { status: CourseStatus.COMPLETED }
    });

    const today = new Date().toISOString().split('T')[0];
    
    // Today's Attendance Stats - Only for active courses
    const attendanceStats = await this.dataSource.query(`
      SELECT 
        COUNT(ca.id) as total,
        COUNT(ca.id) FILTER (WHERE ca.status = 'PRESENT') as present,
        COUNT(ca.id) FILTER (WHERE ca.status = 'ABSENT') as absent,
        COUNT(ca.id) FILTER (WHERE ca.status = 'LATE') as late
      FROM course_attendance ca
      JOIN courses c ON ca.course_id = c.id
      WHERE ca.date = $1 AND c.deleted_at IS NULL
    `, [today]);

    const statsRes = attendanceStats[0];
    const totalAttendance = parseInt(statsRes.total || 0);
    const attendanceRate = totalAttendance > 0 
      ? Math.round((parseInt(statsRes.present || 0) + parseInt(statsRes.late || 0)) / totalAttendance * 100)
      : 0;
    
    const absenceAlerts = parseInt(statsRes.absent || 0);

    // Today's Classes based on study_schedule
    const activeCourses = await this.courseRepository.find({
      where: { status: CourseStatus.ACTIVE },
      relations: ['creator']
    });
    
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date());
    
    const todayClasses = activeCourses.filter(course => {
      return course.studySchedule && course.studySchedule.includes(dayOfWeek);
    }).map(course => {
      const timeMatch = course.studySchedule.match(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/);
      return {
        id: course.id,
        className: course.name,
        time: timeMatch ? timeMatch[0] : course.studySchedule,
        teacher: course.creator?.fullName || 'N/A'
      };
    });

    // Weekly Stats - Only for active courses
    const weeklyStats = await this.dataSource.query(`
      SELECT 
        COUNT(ca.id) FILTER (WHERE ca.status = 'PRESENT') as present,
        COUNT(ca.id) FILTER (WHERE ca.status = 'ABSENT') as absent,
        COUNT(ca.id) FILTER (WHERE ca.status = 'LATE') as late
      FROM course_attendance ca
      JOIN courses c ON ca.course_id = c.id
      WHERE ca.date >= CURRENT_DATE - INTERVAL '7 days' AND c.deleted_at IS NULL
    `);
    
    const wStats = weeklyStats[0];
    const totalW = parseInt(wStats.present || 0) + parseInt(wStats.absent || 0) + parseInt(wStats.late || 0);

    // Recent Activity
    const recentStudents = await this.userRepository.find({
      where: { role: Role.STUDENT },
      order: { createdAt: 'DESC' },
      take: 4
    });

    const recentActivity = recentStudents.map(student => ({
      id: student.id,
      type: "STUDENT_ENROLLED",
      message: `${student.fullName} joined as a new student`,
      timestamp: "Recently"
    }));
    
    return {
      // Unified Stats for Admin
      stats: [
        { label: "Total Students", value: totalStudents.toLocaleString(), icon: "Users", color: "bg-blue-50 text-blue-600" },
        { label: "Total Courses", value: totalCourses.toString(), icon: "BookOpen", color: "bg-green-50 text-green-600" },
        { label: "Attendance Rate", value: `${attendanceRate}%`, icon: "TrendingUp", color: "bg-purple-50 text-purple-600" },
        { label: "Course Finished", value: totalFinished.toString(), icon: "Award", color: "bg-orange-50 text-orange-600" },
      ],
      recentActivity,
      // Manager dashboard specific
      cards: {
        students: {
          value: totalStudents,
          trend: "+0 this week"
        },
        attendanceRate: {
          value: attendanceRate,
          trend: "0% from yesterday"
        },
        pendingMaterials: {
          value: 0,
          note: "0 high priority"
        },
        absenceAlerts: {
          value: absenceAlerts,
          note: "Need attention"
        }
      },
      todayClasses,
      weeklyAttendance: {
        present: totalW > 0 ? Math.round(parseInt(wStats.present) / totalW * 100) : 0,
        late: totalW > 0 ? Math.round(parseInt(wStats.late) / totalW * 100) : 0,
        absent: totalW > 0 ? Math.round(parseInt(wStats.absent) / totalW * 100) : 0
      }
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
