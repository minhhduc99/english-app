import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class MaterialsService {
  private readonly libraryPath = path.join(process.cwd(), '..', '..', 'local-library');

  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {
    // Ensure directory exists
    if (!fs.existsSync(this.libraryPath)) {
      fs.mkdirSync(this.libraryPath, { recursive: true });
    }
  }

  async create(file: Express.Multer.File, uploadedById: string, courseId?: string, category: string = 'GENERAL') {
    const material = this.materialRepository.create({
      name: file.originalname,
      originalName: file.originalname,
      fileName: file.filename,
      fileType: path.extname(file.originalname).substring(1).toUpperCase(),
      size: file.size,
      uploadedById,
      courseId,
      category,
    });

    return await this.materialRepository.save(material);
  }

  async findAll() {
    return await this.materialRepository.find({
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  async delete(id: string, user: any) {
    const material = await this.findOne(id);
    
    // Check ownership: Admin/Manager can delete anything, Teachers only their own
    const isSuperUser = user.role === Role.ADMIN || user.role === Role.MANAGER;
    const isOwner = material.uploadedById === user.id;

    if (!isSuperUser && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this material');
    }

    // Delete file from disk
    const filePath = path.join(this.libraryPath, material.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await this.materialRepository.remove(material);
    return { message: 'Material deleted successfully' };
  }

  async getDownloadPath(id: string) {
    const material = await this.findOne(id);
    const filePath = path.join(this.libraryPath, material.fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Physical file not found on server');
    }

    return {
      path: filePath,
      originalName: material.originalName,
    };
  }

  async countByTeacher(teacherId: string) {
    const total = await this.materialRepository.count({
      where: { uploadedById: teacherId }
    });
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonth = await this.materialRepository.createQueryBuilder('material')
      .where('material.uploadedById = :teacherId', { teacherId })
      .andWhere('material.createdAt >= :firstDayOfMonth', { firstDayOfMonth })
      .getCount();

    // Get breakdown by type (Extension)
    const typeBreakdown = await this.materialRepository.createQueryBuilder('material')
      .select('material.fileType', 'type')
      .addSelect('COUNT(material.id)', 'count')
      .where('material.uploadedById = :teacherId', { teacherId })
      .groupBy('material.fileType')
      .getRawMany();

    // Get breakdown by category
    const categoryBreakdown = await this.materialRepository.createQueryBuilder('material')
      .select('material.category', 'category')
      .addSelect('COUNT(material.id)', 'count')
      .where('material.uploadedById = :teacherId', { teacherId })
      .groupBy('material.category')
      .getRawMany();

    return {
      total,
      thisMonth,
      types: typeBreakdown.map(item => ({
        type: item.type,
        count: parseInt(item.count, 10),
      })),
      categories: categoryBreakdown.map(item => ({
        category: item.category,
        count: parseInt(item.count, 10),
      })),
    };
  }

  async countAll() {
    const total = await this.materialRepository.count();
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonth = await this.materialRepository.createQueryBuilder('material')
      .where('material.createdAt >= :firstDayOfMonth', { firstDayOfMonth })
      .getCount();

    // Get breakdown by type
    const typeBreakdown = await this.materialRepository.createQueryBuilder('material')
      .select('material.fileType', 'type')
      .addSelect('COUNT(material.id)', 'count')
      .groupBy('material.fileType')
      .getRawMany();

    // Get breakdown by category
    const categoryBreakdown = await this.materialRepository.createQueryBuilder('material')
      .select('material.category', 'category')
      .addSelect('COUNT(material.id)', 'count')
      .groupBy('material.category')
      .getRawMany();

    return {
      total,
      thisMonth,
      types: typeBreakdown.map(item => ({
        type: item.type,
        count: parseInt(item.count, 10),
      })),
      categories: categoryBreakdown.map(item => ({
        category: item.category,
        count: parseInt(item.count, 10),
      })),
    };
  }
}
