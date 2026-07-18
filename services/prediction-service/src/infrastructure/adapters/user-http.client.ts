import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { correlationContext } from '@mentorapredict/shared-logger';
import { IUserServiceClient, UserProfileData } from '../../application/ports/output/i-user-service.client';
import { InternalJwtService } from '../auth/internal-jwt.service';
import { UserReferenceOrmEntity } from '../persistence/user-reference.orm-entity';

const TIMEOUT_MS = 5000;

@Injectable()
export class UserHttpClient implements IUserServiceClient {
  private readonly logger = new Logger(UserHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
    @InjectRepository(UserReferenceOrmEntity)
    private readonly userRefRepo: Repository<UserReferenceOrmEntity>,
  ) {
    this.baseUrl = config.get<string>('USER_SERVICE_URL', 'http://user-service:3002');
  }

  async getProfile(userId: string): Promise<UserProfileData | null> {
    const url = `${this.baseUrl}/api/v1/users/internal/profiles/${userId}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          Accept: 'application/json',
          'x-correlation-id': correlationContext.getId() ?? randomUUID(),
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const profile = (await res.json()) as UserProfileData;
      await this.syncUserReference(profile);
      return profile;
    } catch (err) {
      this.logger.warn(`getProfile failed for ${userId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Best-effort local cache upsert (see docs/database/entity-relationship-diagram.md §3)
   * — a failure here must never break the actual profile fetch above.
   */
  private async syncUserReference(profile: UserProfileData): Promise<void> {
    try {
      await this.userRefRepo.upsert(
        {
          id: profile.id,
          role: profile.role,
          isActive: profile.status === 'ACTIVE',
          syncedAt: new Date(),
        },
        ['id'],
      );
    } catch (err) {
      this.logger.warn(`Failed to sync prediction_user_references for ${profile.id}`, err);
    }
  }
}
