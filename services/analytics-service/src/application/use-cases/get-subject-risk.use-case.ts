import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { SubjectRiskLevel } from '../../domain/entities/student-subject-metrics.entity';

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'WORSENING';
const STABLE_THRESHOLD = 0.1;

export interface SubjectRiskView {
  riskLevel: SubjectRiskLevel | null;
  trendSlope: number | null;
  trendDirection: TrendDirection | null;
  factors: {
    averageGrade: number | null;
    complianceIndex: number | null;
    attendanceRate: number | null;
    studyHours: number | null;
    comprehensionAvg: number | null;
  };
  computedAt: string | null;
  weeksOfHistory: number;
}

@Injectable()
export class GetSubjectRiskUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
    @Inject('IAcademicServiceClient')
    private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<SubjectRiskView> {
    const enrollments = await this.academic.getEnrollmentsByStudent(studentId);
    const enrolled = enrollments.some((e) => e.subjectId === subjectId && e.status === 'ACTIVE');
    if (!enrolled) {
      throw new NotFoundException('No estás matriculado activo en esta materia');
    }

    const [latest, history] = await Promise.all([
      this.metricsRepo.findLatestByStudentAndSubject(studentId, subjectId),
      this.metricsRepo.findByStudentSubjectPaginated(studentId, subjectId, { page: 1, limit: 1 }),
    ]);

    if (!latest) {
      return {
        riskLevel: null,
        trendSlope: null,
        trendDirection: null,
        factors: {
          averageGrade: null,
          complianceIndex: null,
          attendanceRate: null,
          studyHours: null,
          comprehensionAvg: null,
        },
        computedAt: null,
        weeksOfHistory: history.total,
      };
    }

    return {
      riskLevel: latest.riskLevel,
      trendSlope: latest.trendSlope,
      trendDirection: this.deriveTrendDirection(latest.trendSlope),
      factors: {
        averageGrade: latest.averageGrade,
        complianceIndex: latest.complianceIndex,
        attendanceRate: latest.attendanceRate,
        studyHours: latest.studyHours,
        comprehensionAvg: latest.comprehensionAvg,
      },
      computedAt: latest.computedAt.toISOString(),
      weeksOfHistory: history.total,
    };
  }

  private deriveTrendDirection(slope: number | null): TrendDirection | null {
    if (slope === null) return null;
    if (Math.abs(slope) < STABLE_THRESHOLD) return 'STABLE';
    return slope > 0 ? 'IMPROVING' : 'WORSENING';
  }
}
