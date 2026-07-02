import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IAuthSyncClient } from '../../application/ports/output/i-auth-sync.client';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

@Injectable()
export class AuthSyncClient implements IAuthSyncClient {
  private readonly logger = new Logger(AuthSyncClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3001');
  }

  async syncRole(userId: string, role: string): Promise<void> {
    await this.patch(`/api/v1/auth/internal/users/${userId}/role`, { role });
  }

  async syncStatus(userId: string, status: string): Promise<void> {
    await this.patch(`/api/v1/auth/internal/users/${userId}/status`, { status });
  }

  private async patch(path: string, body: Record<string, string>): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    const corrId = randomUUID();
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
            'Content-Type': 'application/json',
            'x-correlation-id': corrId,
          },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) {
          throw new Error(`auth-service responded ${res.status} for ${path}`);
        }
        return;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }

    this.logger.error(
      `Could not sync ${path} after ${MAX_RETRIES + 1} attempts`,
      lastError as Error,
    );
  }
}
