import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class TeacherRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = (req.user?.role as string | undefined)?.toUpperCase();
    if (role !== 'TEACHER') {
      throw new ForbiddenException('Only TEACHER role can perform this action');
    }
    return true;
  }
}
