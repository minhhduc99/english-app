import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [UsersModule],
  providers: [AttendanceService, AuthGuard],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
