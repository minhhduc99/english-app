import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
   * Get a single course by ID.
   */
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found.`);
    }
    return course;
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
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
    return { message: `Course "${course.name}" has been deleted.` };
  }
}
