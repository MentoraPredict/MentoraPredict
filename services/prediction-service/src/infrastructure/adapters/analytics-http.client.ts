import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IAnalyticsClient } from '../../application/ports/output/i-analytics.client';
import { RiskSnapshot } from '../../domain/entities/prediction-result.entity';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;

@Injectable()
export class AnalyticsHttpClient implements IAnalyticsClient {
  private readonly logger = new Logger(AnalyticsHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('ANALYTICS_SERVICE_URL', 'http://analytics-service:3004');
  }

  async getRiskSnapshot(studentId: string, periodId: string): Promise<RiskSnapshot> {
    const url = `${this.baseUrl}/api/v1/analytics/internal/risk-snapshot/${studentId}/${periodId}`;
    const corrId = randomUUID();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          'x-correlation-id': corrId,
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new ServiceUnavailableException(
          `analytics-service responded ${res.status} fetching risk for ${studentId}`,
        );
      }

      const data = (await res.json()) as RiskSnapshot;
      return data;
    } catch (err) {
      clearTimeout(timer);
      this.logger.error(`getRiskSnapshot failed for ${studentId}`, err as Error);
      throw new ServiceUnavailableException('analytics-service is unreachable');
    }
  }
}
