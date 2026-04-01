import { Controller, Get, UseGuards, UseInterceptors, ClassSerializerInterceptor, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Placeholder for Swagger if implemented

import { DashboardService } from '../services/dashboard.service';
import { Role } from '../../../common/enums/role.enum';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('dashboard')
@UseInterceptors(ClassSerializerInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Fetch core overview stats for the administrative role.
   * 
   * [Access Control]
   * Only roles with 'ADMIN' or 'MANAGER' roles can access these metrics.
   * Authentication must pass 'RolesGuard' logic.
   */
  @Get('overview')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Retrieve core administrative statistics overview' })
  @ApiResponse({ status: 200, description: 'Stats successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Role restricted access.' })
  async getOverview(@Request() req) {
    // In a prod system, we would log accessing user: req.user.id
    return this.dashboardService.getOverview();
  }
}
