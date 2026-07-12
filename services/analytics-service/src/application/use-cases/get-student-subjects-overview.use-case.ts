import { Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import {
  AlertSeverity,
} from '../../domain/entities/alert.entity';
import { SubjectRiskLevel } from '../../domain/entities/student-subject-metrics.entity';
import { TrendDirection } from './get-subject-risk.use-case';

const STABLE_THRESHOLD = 0.1;
// Only the latest and previous week are needed for a "vs last week" delta —
// not the full history a subject's own detail page pages through.
const RECENT_WEEKS_LIMIT = 2;
// Caps how many of a subject's alerts are returned inline; the subject's
// own detail page is the place for a full paginated alert history.
const ALERTS_PER_SUBJECT_LIMIT = 5;

export interface StudentSubjectOverviewAlert {
  id: string;
  message: string;
  severity: AlertSeverity | null;
}

export interface StudentSubjectOverviewProgressPoint {
  academicYear: number;
  academicWeek: number;
  averageGrade: number | null;
}

export interface StudentSubjectOverview {
  subjectId: string;
  averageGrade: number | null;
  riskLevel: SubjectRiskLevel | null;
  trendDirection: TrendDirection | null;
  computedAt: string | null;
  // Most recent first (index 0 = latest week).
  recentProgress: StudentSubjectOverviewProgressPoint[];
  alerts: StudentSubjectOverviewAlert[];
}

// Replaces what used to be 3 separate per-subject calls (metrics, risk,
// alerts) fired once for every active subject a student has — the frontend
// dashboard fired all of those in parallel for every subject on every
// mount, which is what was tripping Kong's rate limits. This does the same
// lookups server-side, batched across all of the student's active subjects,
// in a single request. AI predictions/recommendations are intentionally
// left out — they live in prediction-service and still need their own
// per-subject call today.
@Injectable()
export class GetStudentSubjectsOverviewUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
    @Inject('IAcademicServiceClient')
    private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(
    studentId: string,
    correlationId?: string,
  ): Promise<StudentSubjectOverview[]> {
    const enrollments = await this.academic.getEnrollmentsByStudent(
      studentId,
      correlationId,
    );
    const activeSubjectIds = enrollments
      .filter((enrollment) => enrollment.status === 'ACTIVE')
      .map((enrollment) => enrollment.subjectId);

    if (activeSubjectIds.length === 0) {
      return [];
    }

    const [recentBySubject, alertsResult] = await Promise.all([
      Promise.all(
        activeSubjectIds.map((subjectId) =>
          this.metricsRepo.findRecentByStudentSubject(
            studentId,
            subjectId,
            RECENT_WEEKS_LIMIT,
          ),
        ),
      ),
      this.alertRepo.findByStudentPaginated(
        studentId,
        {},
        { page: 1, limit: 100 },
      ),
    ]);

    const alertsBySubject = new Map<string, StudentSubjectOverviewAlert[]>();
    for (const alert of alertsResult.items) {
      if (!alert.subjectId) continue;
      const existing = alertsBySubject.get(alert.subjectId) ?? [];
      if (existing.length < ALERTS_PER_SUBJECT_LIMIT) {
        existing.push({
          id: alert.id,
          message: alert.message,
          severity: alert.severity,
        });
      }
      alertsBySubject.set(alert.subjectId, existing);
    }

    return activeSubjectIds.map((subjectId, index) => {
      const recent = recentBySubject[index];
      const latest = recent[0] ?? null;

      return {
        subjectId,
        averageGrade: latest?.averageGrade ?? null,
        riskLevel: latest?.riskLevel ?? null,
        trendDirection: this.deriveTrendDirection(latest?.trendSlope ?? null),
        computedAt: latest?.computedAt.toISOString() ?? null,
        recentProgress: recent.map((entry) => ({
          academicYear: entry.academicYear,
          academicWeek: entry.academicWeek,
          averageGrade: entry.averageGrade,
        })),
        alerts: alertsBySubject.get(subjectId) ?? [],
      };
    });
  }

  private deriveTrendDirection(slope: number | null): TrendDirection | null {
    if (slope === null) return null;
    if (Math.abs(slope) < STABLE_THRESHOLD) return 'STABLE';
    return slope > 0 ? 'IMPROVING' : 'WORSENING';
  }
}
