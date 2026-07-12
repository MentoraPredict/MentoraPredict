import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { correlationContext } from '@mentorapredict/shared-logger';
import { IPredictionClientPort } from '../../domain/ports/i-prediction-client.port';
import { InternalJwtService } from '../auth/internal-jwt.service';

@Injectable()
export class PredictionHttpClient implements IPredictionClientPort {
  private readonly logger = new Logger(PredictionHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('PREDICTION_SERVICE_URL', 'http://prediction-service:3006');
  }

  async triggerRecalculate(studentId: string, subjectId: string, periodId: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/prediction/internal/recalculate`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
          'Content-Type': 'application/json',
          'x-correlation-id': correlationContext.getId() ?? randomUUID(),
        },
        body: JSON.stringify({ studentId, subjectId, periodId }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        this.logger.warn(`Prediction recalculate responded ${res.status} for student ${studentId}/${subjectId}`);
      }
    } catch (err) {
      this.logger.error(
        `Prediction recalculate call failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
