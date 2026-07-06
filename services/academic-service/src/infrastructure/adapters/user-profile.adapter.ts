import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserProfilePort, UserProfileData } from '../../application/ports/output/i-user-profile.port';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;

@Injectable()
export class UserProfileAdapter implements IUserProfilePort {
  private readonly logger = new Logger(UserProfileAdapter.name);
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('USER_SERVICE_URL', 'http://user-service:3002');
  }

  async getProfile(userId: string): Promise<UserProfileData | null> {
    const url = `${this.baseUrl}/api/v1/users/internal/profiles/${userId}`;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.internalJwt.createServiceToken()}` },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      return res.json() as Promise<UserProfileData>;
    } catch (err) {
      this.logger.warn(`Failed to fetch profile for ${userId}`, err);
      return null;
    }
  }
}
