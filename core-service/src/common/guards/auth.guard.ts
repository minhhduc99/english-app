import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

/**
 * AuthGuard: Extracts user identity from the Authorization header.
 *
 * Token format: "Bearer base64(<userId>)"
 * - On login, the server encodes userId into a base64 string as a lightweight token.
 * - This guard decodes it, loads the user from DB, and attaches to `req.user`.
 * - Must be applied BEFORE RolesGuard so `req.user` is available for role checking.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header.');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      // Decode the base64 token to get the userId
      const userId = Buffer.from(token, 'base64').toString('utf-8');

      if (!userId || userId.length < 10) {
        throw new Error('Invalid token payload');
      }

      // Lookup user from database
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('User not found. Token may be expired.');
      }

      // Attach user to request (used by RolesGuard)
      const { password, ...safeUser } = user;
      request.user = safeUser;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
