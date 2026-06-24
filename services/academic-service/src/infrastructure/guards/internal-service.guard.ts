import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-internal-api-key'] as string | undefined;
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected || key !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }
    return true;
  }
}
