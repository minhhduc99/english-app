import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    /**
     * @Security Professional Security Note:
     * In a real system, the 'user' object is populated by a JwtAuthGuard 
     * before this RolesGuard is triggered.
     */
    if (!user) {
      throw new ForbiddenException('Access Denied: No authentication found.');
    }

    const hasRole = user.role === Role.ADMIN || requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException(`Insufficient Permissions: ${requiredRoles.join(', ')} required.`);
    }

    return true;
  }
}
