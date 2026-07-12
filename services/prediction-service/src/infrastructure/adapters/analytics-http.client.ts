import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { correlationContext } from '@mentorapredict/shared-logger';
import { IAnalyticsClient, LatestSubjectMetric } from '../../application/ports/output/i-analytics.client';
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
    const corrId = correlationContext.getId() ?? randomUUID();
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

  async getLatestSubjectMetric(studentId: string, subjectId: string): Promise<LatestSubjectMetric | null> {
    const url = `${this.baseUrl}/api/v1/analytics/internal/students/${studentId}/subjects/${subjectId}/metrics/latest`;
    const corrId = correlationContext.getId() ?? randomUUID();
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
          `analytics-service responded ${res.status} fetching latest metric for ${studentId}/${subjectId}`,
        );
      }

      // A 2xx response with an empty/whitespace-only body means "no metric
      // yet" for this student/subject — treat it the same as an explicit
      // `null`, since that's already a valid, expected return value here
      // (see GenerateSubjectPredictionUseCase's "not enough data" branch).
      // Only a genuinely malformed non-empty body is a real failure.
      const raw = await res.text();
      if (!raw.trim()) {
        return null;
      }

      try {
        return JSON.parse(raw) as LatestSubjectMetric | null;
      } catch (parseErr) {
        this.logger.error(
          `getLatestSubjectMetric got a non-JSON body for ${studentId}/${subjectId}: ${raw.slice(0, 200)}`,
          parseErr as Error,
        );
        throw new ServiceUnavailableException('analytics-service returned an unexpected response');
      }
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      this.logger.error(`getLatestSubjectMetric failed for ${studentId}/${subjectId}`, err as Error);
      throw new ServiceUnavailableException('analytics-service is unreachable');
    }
  }
}
