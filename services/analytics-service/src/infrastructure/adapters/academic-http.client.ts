import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { Grade } from '../../domain/entities/grade.vo';
import { Enrollment } from '../../domain/entities/enrollment.vo';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

@Injectable()
export class AcademicHttpClient implements IAcademicServiceClient {
  private readonly logger = new Logger(AcademicHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('ACADEMIC_SERVICE_URL', 'http://academic-service:3003');
  }

  getGradesByStudent(studentId: string, periodId: string, correlationId?: string): Promise<Grade[]> {
    return this.request<Grade[]>(
      `/api/v1/academic/internal/students/${studentId}/grades?periodId=${periodId}`,
      correlationId,
    );
  }

  getEnrollmentsByStudent(studentId: string, correlationId?: string): Promise<Enrollment[]> {
    return this.request<Enrollment[]>(
      `/api/v1/academic/internal/students/${studentId}/enrollments`,
      correlationId,
    );
  }

  private async request<T>(path: string, correlationId?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const corrId = correlationId ?? randomUUID();
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.internalJwt.createServiceToken()}`,
            'x-correlation-id': corrId,
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          throw new Error(`Academic service responded ${res.status} for ${path}`);
        }
        return await res.json() as T;
      } catch (err) {
        lastError = err;
        this.logger.warn(`Academic HTTP attempt ${attempt + 1} failed: ${path}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }
}
