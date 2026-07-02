import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IAcademicContextClient, AcademicContext } from '../../application/ports/output/i-academic-context.client';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;

interface StudentGradeView {
  subjectId: string;
  subjectName: string;
  subjectCredits: number;
  value: number;
}

@Injectable()
export class AcademicHttpClient implements IAcademicContextClient {
  private readonly logger = new Logger(AcademicHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
  ) {
    this.baseUrl = config.get<string>('ACADEMIC_SERVICE_URL', 'http://academic-service:3003');
  }

  async getStudentContext(studentId: string, periodId: string): Promise<AcademicContext> {
    const url = `${this.baseUrl}/api/v1/academic/internal/students/${studentId}/grades?periodId=${periodId}`;
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
          `academic-service responded ${res.status} fetching grades for ${studentId}`,
        );
      }

      const grades = (await res.json()) as StudentGradeView[];
      return {
        studentId,
        periodId,
        subjects: grades.map((g) => ({
          subjectId: g.subjectId,
          name: g.subjectName,
          currentGrade: g.value,
          credits: g.subjectCredits,
        })),
      };
    } catch (err) {
      clearTimeout(timer);
      this.logger.error(`getStudentContext failed for ${studentId}`, err as Error);
      throw new ServiceUnavailableException('academic-service is unreachable');
    }
  }
}
