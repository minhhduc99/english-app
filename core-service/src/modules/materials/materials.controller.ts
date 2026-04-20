import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  BadRequestException,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as path from 'path';
import { Response } from 'express';
import { MaterialsService } from './materials.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('materials')
@UseGuards(AuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), '..', '..', 'local-library'),
        filename: (req, file, cb) => {
          const fileName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.xlsx', '.pptx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, XLSX, and PPTX files are allowed'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadedById') uploadedById: string,
    @Body('courseId') courseId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return await this.materialsService.create(file, uploadedById, courseId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async findAll() {
    return await this.materialsService.findAll();
  }

  @Get('download/:id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async download(@Param('id') id: string, @Res() res: Response) {
    const fileInfo = await this.materialsService.getDownloadPath(id);
    return res.download(fileInfo.path, fileInfo.originalName);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.TEACHER)
  async remove(@Param('id') id: string, @Request() req: any) {
    return await this.materialsService.delete(id, req.user);
  }
}
