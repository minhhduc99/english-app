import { Controller, Get, Put, Post, Body, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('api/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Req() req) {
    const userId = req.user.id;
    return this.notificationsService.getForUser(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN, Role.MANAGER)
  async broadcastToClass(@Body() dto: BroadcastNotificationDto) {
    await this.notificationsService.broadcastToClass(dto);
    return { success: true, message: 'Notification broadcasted to class' };
  }
}
