import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  IAcademicContextClient,
  AcademicContext,
  EnrollmentView,
  SubjectOwnership,
  SubjectGradesContext,
} from '../../application/ports/output/i-academic-context.client';
import { InternalJwtService } from '../auth/internal-jwt.service';

const TIMEOUT_MS = 5000;
// Same passing-grade threshold used by analytics-service (get-risk-snapshot,
// recalculate-student-metrics) — 0-20 scale.
const PASSING_GRADE = 14;

interface StudentGradeView {
  subjectId: string;
  subjectName: string;
  subjectCredits: number;
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
      credits: subjectGrades[0]?.subjectCredits ?? 0,
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

  private async get<T>(url: string, errorContext: string): Promise<T> {
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
