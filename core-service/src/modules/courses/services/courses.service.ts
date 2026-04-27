import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new course.
   * Validates that the course code is unique and endDate > startDate.
   */
  async create(dto: CreateCourseDto, createdBy?: string): Promise<Course> {
    this.logger.log(`Creating course: ${dto.name} (${dto.courseCode})`);

    // Validate date range
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date.');
    }

    // Check for duplicate course code
    const existingCourse = await this.courseRepository.findOne({
      where: { courseCode: dto.courseCode },
    });
    if (existingCourse) {
      throw new ConflictException(`Course code "${dto.courseCode}" already exists.`);
    }

    const course = this.courseRepository.create({
      ...dto,
      createdBy,
    });

    const saved = await this.courseRepository.save(course);
    this.logger.log(`Course created with ID: ${saved.id}`);
    return saved;
  }

  /**
   * Get all courses with optional search/filter.
   */
  async findAll(search?: string): Promise<Course[]> {
    this.logger.log('Fetching all courses');

    const qb = this.courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.creator', 'creator')
      .orderBy('course.createdAt', 'DESC');

    if (search) {
      qb.where(
        'LOWER(course.name) LIKE :search OR LOWER(course.courseCode) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  /**
   * Get courses assigned to a specific teacher.
   */
  async findForTeacher(teacherId: string, search?: string): Promise<Course[]> {
    this.logger.log(`Fetching courses for teacher: ${teacherId}`);
    
    // Ensure table exists just in case
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_teachers (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);

    const qb = this.courseRepository.createQueryBuilder('course')
      .innerJoin('course_teachers', 'ct', 'ct.course_id = course.id AND ct.user_id = :teacherId', { teacherId })
      .leftJoinAndSelect('course.creator', 'creator')
      .where('course.status = :status', { status: 'ACTIVE' })
      .orderBy('course.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        '(LOWER(course.name) LIKE :search OR LOWER(course.courseCode) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  /**
   * Get courses assigned to a specific student.
   */
  async findForStudent(studentId: string, search?: string): Promise<any[]> {
    this.logger.log(`Fetching courses for student: ${studentId}`);
    
    // Ensure table exists just in case
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_students (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);

    let searchQuery = '';
    const params: any[] = [studentId];

    if (search) {
      searchQuery = `AND (LOWER(c.name) LIKE $2 OR LOWER(c.course_code) LIKE $2)`;
      params.push(`%${search.toLowerCase()}%`);
    }

    const sql = `
      SELECT 
        c.*,
        c.course_code as "courseCode",
        c.start_date as "startDate",
        c.end_date as "endDate",
        c.study_schedule as "studySchedule",
        c.max_attendants as "maxAttendants",
        (
          SELECT string_agg(u."fullName", ', ')
          FROM course_teachers ct
          JOIN users u ON ct.user_id = u.id
          WHERE ct.course_id = c.id
        ) as "teacherNames",
        (
          SELECT COUNT(*)::int 
          FROM lessons l 
          WHERE l."courseId" = c.id AND l."deletedAt" IS NULL
        ) as "totalLessons",
        (
          SELECT COUNT(DISTINCT ca.date)::int
          FROM course_attendance ca
          WHERE ca.course_id = c.id
        ) as "completedLessons"
      FROM courses c
      INNER JOIN course_students cs ON cs.course_id = c.id AND cs.user_id = $1
      WHERE c.status = 'ACTIVE' AND c.deleted_at IS NULL ${searchQuery}
      ORDER BY c.created_at DESC
    `;

    return this.dataSource.query(sql, params);
  }

  /**
   * Get a single course by ID.
   */
  async findOne(id: string): Promise<any> {
    const sql = `
      SELECT 
        c.*,
        c.course_code as "courseCode",
        c.start_date as "startDate",
        c.end_date as "endDate",
        c.study_schedule as "studySchedule",
        c.max_attendants as "maxAttendants",
        (
          SELECT string_agg(u."fullName", ', ')
          FROM course_teachers ct
          JOIN users u ON ct.user_id = u.id
          WHERE ct.course_id = c.id
        ) as "teacherNames"
      FROM courses c
      WHERE c.id = $1 AND c.deleted_at IS NULL
    `;
    const results = await this.dataSource.query(sql, [id]);
    if (!results || results.length === 0) {
      throw new NotFoundException(`Course with ID "${id}" not found.`);
    }
    return results[0];
  }

  /**
   * Update an existing course.
   */
  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    this.logger.log(`Updating course ID: ${id}`);

    const course = await this.findOne(id);

    // If changing course code, validate uniqueness
    if (dto.courseCode && dto.courseCode !== course.courseCode) {
      const existingCourse = await this.courseRepository.findOne({
        where: { courseCode: dto.courseCode },
      });
      if (existingCourse) {
        throw new ConflictException(`Course code "${dto.courseCode}" already exists.`);
      }
    }

    // Validate date range if either date is being updated
    const startDate = dto.startDate || course.startDate;
    const endDate = dto.endDate || course.endDate;
    if (new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException('End date must be after start date.');
    }

    Object.assign(course, dto);
    const updated = await this.courseRepository.save(course);
    this.logger.log(`Course updated: ${updated.id}`);
    return updated;
  }

  /**
   * Delete a course by ID.
   */
  async remove(id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting course ID: ${id}`);
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found.`);
    }
    course.isDeleted = true;
    // We save first to ensure isDeleted is persisted, then softRemove for deletedAt
    await this.courseRepository.save(course);
    await this.courseRepository.softRemove(course);
    return { message: `Course "${course.name}" has been deleted.` };
  }

  /**
   * Assign students to course via course_students junction table.
   * Uses the ORM 'users' table. Creates the table on first use.
   */
  async assignStudents(courseId: string, studentIds: string[]): Promise<{ message: string }> {
    // Ensure the join table exists (idempotent)
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_students (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);

    for (const studentId of studentIds) {
      await this.dataSource.query(
        `INSERT INTO course_students (course_id, user_id, status)
         VALUES ($1, $2, 'ACTIVE')
         ON CONFLICT (course_id, user_id) DO UPDATE SET status = 'ACTIVE'`,
        [courseId, studentId]
      );
    }
    return { message: 'Students assigned successfully.' };
  }

  /**
   * Get members assigned to this course (from course_students).
   */
  async getMembers(courseId: string) {
    // Ensure table exists before querying
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_students (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);
    return this.dataSource.query(`
      SELECT
        cs.user_id AS id,
        u."fullName",
        'STU-' || UPPER(SUBSTR(u.id::text, 1, 6)) AS "studentId",
        UPPER(SUBSTR(u."fullName", 1, 1)) AS avatar
      FROM course_students cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.course_id = $1 AND cs.status = 'ACTIVE' AND u."deletedAt" IS NULL
      ORDER BY u."fullName"
    `, [courseId]);
  }

  /**
   * Get all students in the system from ORM-managed users table.
   */
  async getAvailableStudents() {
    return this.dataSource.query(`
      SELECT id, "fullName"
      FROM users
      WHERE role::text = 'STUDENT' AND "deletedAt" IS NULL
      ORDER BY "fullName"
    `);
  }

  /**
   * Assign teachers to course via course_teachers junction table.
   */
  async assignTeachers(courseId: string, teacherIds: string[]): Promise<{ message: string }> {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_teachers (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);

    // Remove existing active teachers to replace them or you can just add
    // Since UI might send full exact list, it's safer to clear and insert
    await this.dataSource.query(`DELETE FROM course_teachers WHERE course_id = $1`, [courseId]);

    for (const teacherId of teacherIds) {
      await this.dataSource.query(
        `INSERT INTO course_teachers (course_id, user_id, status)
         VALUES ($1, $2, 'ACTIVE')`,
        [courseId, teacherId]
      );
    }
    return { message: 'Teachers assigned successfully.' };
  }

  /**
   * Get teachers assigned to this course.
   */
  async getTeachers(courseId: string) {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_teachers (
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id   UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        status    VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (course_id, user_id)
      )
    `);
    return this.dataSource.query(`
      SELECT
        ct.user_id AS id,
        u."fullName",
        u.email
      FROM course_teachers ct
      JOIN users u ON ct.user_id = u.id
      WHERE ct.course_id = $1 AND ct.status = 'ACTIVE' AND u."deletedAt" IS NULL
      ORDER BY u."fullName"
    `, [courseId]);
  }

  /**
   * Get all teachers in the system from users table.
   */
  async getAvailableTeachers() {
    return this.dataSource.query(`
      SELECT id, "fullName"
      FROM users
      WHERE role::text = 'TEACHER' AND "deletedAt" IS NULL
      ORDER BY "fullName"
    `);
  }

  /**
   * Assign materials to course via course_materials junction table.
   */
  async assignMaterials(courseId: string, materialIds: string[]): Promise<{ message: string }> {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_materials (
        course_id   UUID NOT NULL REFERENCES courses(id)   ON DELETE CASCADE,
        material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        PRIMARY KEY (course_id, material_id)
      )
    `);

    for (const materialId of materialIds) {
      await this.dataSource.query(
        `INSERT INTO course_materials (course_id, material_id)
         VALUES ($1, $2)
         ON CONFLICT (course_id, material_id) DO NOTHING`,
        [courseId, materialId]
      );
    }
    return { message: 'Materials assigned successfully.' };
  }

  /**
   * Get materials assigned to this course.
   */
  async getMaterials(courseId: string) {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS course_materials (
        course_id   UUID NOT NULL REFERENCES courses(id)   ON DELETE CASCADE,
        material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        PRIMARY KEY (course_id, material_id)
      )
    `);
    return this.dataSource.query(`
      SELECT
        m.id,
        m.name,
        m."originalName",
        m."fileType" AS type,
        m.size,
        m."createdAt"
      FROM course_materials cm
      JOIN materials m ON cm.material_id = m.id
      WHERE cm.course_id = $1 AND m."deletedAt" IS NULL
      ORDER BY m."createdAt" DESC
    `, [courseId]);

  }

  /**
   * Remove a material from a course.
   */
  async unassignMaterial(courseId: string, materialId: string): Promise<{ message: string }> {
    await this.dataSource.query(`
      DELETE FROM course_materials 
      WHERE course_id = $1 AND material_id = $2
    `, [courseId, materialId]);
    return { message: 'Material removed from course.' };
  }
}

