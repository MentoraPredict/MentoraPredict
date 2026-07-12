import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { correlationContext } from '@mentorapredict/shared-logger';
import { IUserServiceClient } from '../../domain/ports/i-user-service.client';
import { InternalJwtService } from '../../../infrastructure/auth/internal-jwt.service';

const TIMEOUT_MS = 5000;

@Injectable()
export class UserHttpClient implements IUserServiceClient {
  private readonly logger = new Logger(UserHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('USER_SERVICE_URL', 'http://user-service:3002');
  }

  async getUserIdsByRole(role: string): Promise<string[]> {
    const url = `${this.baseUrl}/api/v1/users/internal/by-role?role=${role}`;
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

      if (!res.ok) {
        this.logger.warn(`user-service by-role responded ${res.status} for role ${role}`);
        return [];
      }
      return (await res.json()) as string[];
    } catch (err) {
      this.logger.error(
        `user-service by-role lookup failed for role ${role}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }
}
