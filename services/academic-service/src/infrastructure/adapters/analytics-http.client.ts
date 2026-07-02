import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAnalyticsClientPort, LatestSubjectMetric } from '../../application/ports/output/i-analytics-client.port';
import { InternalJwtService } from '../auth/internal-jwt.service';

@Injectable()
export class AnalyticsHttpClient implements IAnalyticsClientPort {
  private readonly logger = new Logger(AnalyticsHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('ANALYTICS_SERVICE_URL', 'http://analytics-service:3004');
  }

  async triggerRecalculate(
    subjectId: string,
    periodId: string,
    studentIds: string[],
  ): Promise<void> {
    const url = `${this.baseUrl}/api/v1/analytics/internal/recalculate`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjectId, periodId, studentIds }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        this.logger.warn(`Analytics recalculate responded ${res.status} for subject ${subjectId}`);
      }
    } catch (err) {
      this.logger.error(
        `Analytics recalculate call failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async getLatestSubjectMetric(
    studentId: string,
    subjectId: string,
  ): Promise<LatestSubjectMetric | null> {
    const url = `${this.baseUrl}/api/v1/analytics/internal/students/${studentId}/subjects/${subjectId}/metrics/latest`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        this.logger.warn(`Analytics metrics lookup responded ${res.status} for student ${studentId}/${subjectId}`);
        return null;
      }
      return (await res.json()) as LatestSubjectMetric | null;
    } catch (err) {
      // Degrade gracefully: an unreachable analytics-service should not fail
      // the caller's request, it just means riskLevel/currentAverage read as
      // null — the same as "no metric computed yet".
      this.logger.error(
        `Analytics metrics lookup failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }
}
