import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AttendanceRateSummary, CheckInSummary, EvaluationWeight, IAcademicServiceClient, PeriodDetails, SubjectDetails, SubjectOwnership } from '../../domain/ports/i-academic-service.client';
import { Grade } from '../../domain/entities/grade.vo';
import { Enrollment } from '../../domain/entities/enrollment.vo';
import { InternalJwtService } from '../auth/internal-jwt.service';
import { SubjectReferenceOrmEntity } from '../persistence/subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from '../persistence/period-reference.orm-entity';

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

@Injectable()
export class AcademicHttpClient implements IAcademicServiceClient {
  private readonly logger = new Logger(AcademicHttpClient.name);
  private readonly baseUrl: string;

  constructor(
    config: ConfigService,
    private readonly internalJwt: InternalJwtService,
    @InjectRepository(SubjectReferenceOrmEntity)
    private readonly subjectRefRepo: Repository<SubjectReferenceOrmEntity>,
    @InjectRepository(PeriodReferenceOrmEntity)
    private readonly periodRefRepo: Repository<PeriodReferenceOrmEntity>,
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

  getEvaluationsBySubject(subjectId: string, correlationId?: string): Promise<EvaluationWeight[]> {
    return this.request<EvaluationWeight[]>(
      `/api/v1/academic/internal/subjects/${subjectId}/evaluations`,
      correlationId,
    );
  }

  getLatestCheckIn(
    studentId: string,
    subjectId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<CheckInSummary | null> {
    return this.request<CheckInSummary | null>(
      `/api/v1/academic/internal/students/${studentId}/check-ins/latest?subjectId=${subjectId}&periodId=${periodId}`,
      correlationId,
    );
  }

  getAttendanceRate(
    studentId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<AttendanceRateSummary | null> {
    return this.request<AttendanceRateSummary | null>(
      `/api/v1/academic/internal/students/${studentId}/attendance-rate?subjectId=${subjectId}`,
      correlationId,
    );
  }

  getSubjectOwnership(
    teacherId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<SubjectOwnership> {
    return this.request<SubjectOwnership>(
      `/api/v1/academic/internal/subjects/${subjectId}/teachers/${teacherId}/is-owner`,
      correlationId,
    );
  }

  async getSubjectDetails(subjectId: string, correlationId?: string): Promise<SubjectDetails | null> {
    try {
      const subject = await this.request<SubjectDetails>(
        `/api/v1/academic/internal/subjects/${subjectId}`,
        correlationId,
      );
      await this.syncSubjectReference(subject);
      return subject;
    } catch (err) {
      this.logger.warn(`getSubjectDetails failed for ${subjectId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  async getPeriodDetails(periodId: string, correlationId?: string): Promise<PeriodDetails | null> {
    try {
      const period = await this.request<PeriodDetails>(
        `/api/v1/academic/internal/periods/${periodId}`,
        correlationId,
      );
      await this.syncPeriodReference(period);
      return period;
    } catch (err) {
      this.logger.warn(`getPeriodDetails failed for ${periodId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * Best-effort local cache upserts (see docs/database/entity-relationship-diagram.md §3)
   * — a failure here must never break the actual fetches above.
   */
  private async syncSubjectReference(subject: SubjectDetails): Promise<void> {
    try {
      await this.subjectRefRepo.upsert(
        { id: subject.id, isActive: subject.isActive, syncedAt: new Date() },
        ['id'],
      );
    } catch (err) {
      this.logger.warn(`Failed to sync subject_references for ${subject.id}`, err);
    }
  }

  private async syncPeriodReference(period: PeriodDetails): Promise<void> {
    try {
      await this.periodRefRepo.upsert(
        { id: period.id, status: period.status, syncedAt: new Date() },
        ['id'],
      );
    } catch (err) {
      this.logger.warn(`Failed to sync period_references for ${period.id}`, err);
    }
  }

  getStudentsByTeacher(teacherId: string, periodId: string, correlationId?: string): Promise<string[]> {
    return this.request<string[]>(
      `/api/v1/academic/internal/teachers/${teacherId}/students?periodId=${periodId}`,
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
