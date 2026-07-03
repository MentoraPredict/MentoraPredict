import { Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { SubjectRiskLevel } from '../../domain/entities/student-subject-metrics.entity';

export interface LatestSubjectMetricView {
  averageGrade: number | null;
  riskLevel: SubjectRiskLevel | null;
  // Fase 8 — prediction-service needs these to derive a recommendation and
  // to know when there isn't enough history for a real prediction.
  trendSlope: number | null;
  complianceIndex: number | null;
  attendanceRate: number | null;
  studyHours: number | null;
  comprehensionAvg: number | null;
  computedAt: Date;
}

@Injectable()
export class GetLatestSubjectMetricUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<LatestSubjectMetricView | null> {
    const metric = await this.metricsRepo.findLatestByStudentAndSubject(studentId, subjectId);
    if (!metric) return null;
    return {
      averageGrade: metric.averageGrade,
      riskLevel: metric.riskLevel,
      trendSlope: metric.trendSlope,
      complianceIndex: metric.complianceIndex,
      attendanceRate: metric.attendanceRate,
      studyHours: metric.studyHours,
      comprehensionAvg: metric.comprehensionAvg,
      computedAt: metric.computedAt,
    };
  }
}
