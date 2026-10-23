import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { correlationContext } from '@mentorapredict/shared-logger';
import {
  IAcademicContextClient,
  AcademicContext,
  EnrollmentView,
  SubjectOwnership,
  SubjectGradesContext,
  SubjectDetails,
  PeriodDetails,
} from '../../application/ports/output/i-academic-context.client';
import { InternalJwtService } from '../auth/internal-jwt.service';
import { SubjectReferenceOrmEntity } from '../persistence/subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from '../persistence/period-reference.orm-entity';

const TIMEOUT_MS = 5000;
// Same passing-grade threshold used by analytics-service (get-risk-snapshot,
// recalculate-student-metrics) — 0-10 scale (domain/grade-scale.ts in analytics-service).
const PASSING_GRADE = 7;

interface StudentGradeView {
  subjectId: string;
  subjectName: string;
  value: number;
}

interface TopicView {
  title: string;
}

@Injectable()
export class AcademicHttpClient implements IAcademicContextClient {
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

  async getStudentContext(studentId: string, periodId: string): Promise<AcademicContext> {
    const url = `${this.baseUrl}/api/v1/academic/internal/students/${studentId}/grades?periodId=${periodId}`;
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
        })),
      };
    } catch (err) {
      clearTimeout(timer);
      this.logger.error(`getStudentContext failed for ${studentId}`, err as Error);
      throw new ServiceUnavailableException('academic-service is unreachable');
    }
  }

  async getEnrollmentsByStudent(studentId: string): Promise<EnrollmentView[]> {
    const url = `${this.baseUrl}/api/v1/academic/internal/students/${studentId}/enrollments`;
    return this.get<EnrollmentView[]>(url, `getEnrollmentsByStudent failed for ${studentId}`);
  }

  async getSubjectOwnership(teacherId: string, subjectId: string): Promise<SubjectOwnership> {
    const url = `${this.baseUrl}/api/v1/academic/internal/subjects/${subjectId}/teachers/${teacherId}/is-owner`;
    return this.get<SubjectOwnership>(url, `getSubjectOwnership failed for ${teacherId}/${subjectId}`);
  }

  async getSubjectGradesContext(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<SubjectGradesContext> {
    const url = `${this.baseUrl}/api/v1/academic/internal/students/${studentId}/grades?periodId=${periodId}`;
    const grades = await this.get<StudentGradeView[]>(url, `getSubjectGradesContext failed for ${studentId}/${subjectId}`);
    const subjectGrades = grades.filter((g) => g.subjectId === subjectId);

    return {
      subjectName: subjectGrades[0]?.subjectName ?? '',
      currentGrade:
        subjectGrades.length > 0
          ? subjectGrades.reduce((sum, g) => sum + g.value, 0) / subjectGrades.length
          : null,
      failedEvaluations: subjectGrades.filter((g) => g.value < PASSING_GRADE).length,
    };
  }

  async getSubjectTopics(subjectId: string): Promise<string[]> {
    const url = `${this.baseUrl}/api/v1/academic/internal/subjects/${subjectId}/topics`;
    const topics = await this.get<TopicView[]>(url, `getSubjectTopics failed for ${subjectId}`);
    return topics.map((t) => t.title);
  }

  async getSubjectDetails(subjectId: string): Promise<SubjectDetails | null> {
    try {
      const subject = await this.get<SubjectDetails>(
        `${this.baseUrl}/api/v1/academic/internal/subjects/${subjectId}`,
        `getSubjectDetails failed for ${subjectId}`,
      );
      await this.syncSubjectReference(subject);
      return subject;
    } catch (err) {
      this.logger.warn(`getSubjectDetails failed for ${subjectId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  async getPeriodDetails(periodId: string): Promise<PeriodDetails | null> {
    try {
      const period = await this.get<PeriodDetails>(
        `${this.baseUrl}/api/v1/academic/internal/periods/${periodId}`,
        `getPeriodDetails failed for ${periodId}`,
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
      this.logger.warn(`Failed to sync prediction_subject_references for ${subject.id}`, err);
    }
  }

  private async syncPeriodReference(period: PeriodDetails): Promise<void> {
    try {
      await this.periodRefRepo.upsert(
        { id: period.id, status: period.status, syncedAt: new Date() },
        ['id'],
      );
    } catch (err) {
      this.logger.warn(`Failed to sync prediction_period_references for ${period.id}`, err);
    }
  }

  private async get<T>(url: string, errorContext: string): Promise<T> {
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
        throw new ServiceUnavailableException(`academic-service responded ${res.status}: ${errorContext}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      this.logger.error(errorContext, err as Error);
      throw new ServiceUnavailableException('academic-service is unreachable');
    }
  }
}
