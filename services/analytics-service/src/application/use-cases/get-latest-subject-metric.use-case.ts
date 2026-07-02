import { Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { SubjectRiskLevel } from '../../domain/entities/student-subject-metrics.entity';

export interface LatestSubjectMetricView {
  averageGrade: number | null;
  riskLevel: SubjectRiskLevel | null;
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
      computedAt: metric.computedAt,
    };
  }
}
