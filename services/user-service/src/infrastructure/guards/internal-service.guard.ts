import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing service token');
    }

    try {
      const payload = this.jwt.verify<{ scope?: string }>(auth.slice(7));
      if (payload.scope !== 'service:internal') {
        throw new UnauthorizedException('Invalid service scope');
      }
      return true;
    } catch (error) {
      console.error('[InternalServiceGuard] Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid service token');
    }
  }
}
