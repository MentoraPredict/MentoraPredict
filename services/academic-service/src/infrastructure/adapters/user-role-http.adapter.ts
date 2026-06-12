import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITeacherRolePort } from '../../application/ports/output/i-teacher-role.port';

@Injectable()
export class UserRoleHttpAdapter implements ITeacherRolePort {
  private readonly logger = new Logger(UserRoleHttpAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async isTeacher(userId: string): Promise<boolean> {
    const baseUrl = this.config.get<string>('USER_SERVICE_URL', 'http://user-service:3002');
    try {
      const res = await fetch(`${baseUrl}/users/${userId}`);
      if (!res.ok) return false;
      const data = await res.json() as { role?: string };
      return data.role === 'TEACHER';
    } catch (err) {
      this.logger.warn(`Failed to verify teacher role for ${userId}`, err);
      return false;
    }
  }
}
