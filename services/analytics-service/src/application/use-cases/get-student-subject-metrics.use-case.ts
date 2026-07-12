import { Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { StudentSubjectMetricsEntity } from '../../domain/entities/student-subject-metrics.entity';
import { linearRegression } from '../../infrastructure/wasm/linear-regression.wasm';

const MIN_WEEKS_FOR_TREND = 3;

export type SubjectTrendClassification = 'ASCENDING' | 'STABLE' | 'DESCENDING';

export interface SubjectTrendSummary {
  slope: number;
  intercept: number;
  classification: SubjectTrendClassification;
  weeksAnalyzed: number;
}

@Injectable()
export class GetStudentSubjectMetricsUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
  ) {}

  async execute(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{
    data: StudentSubjectMetricsEntity[];
    total: number;
    page: number;
    limit: number;
    trend: SubjectTrendSummary | null;
  }> {
    const { items, total } = await this.metricsRepo.findByStudentSubjectPaginated(
      studentId,
      subjectId,
      pagination,
    );
    return {
      data: items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      trend: this.calculateTrend(items),
    };
  }

  // `items` comes back newest-first (see StudentSubjectMetricsRepository);
  // the regression needs chronological order so the weekly x-axis is meaningful.
  private calculateTrend(items: StudentSubjectMetricsEntity[]): SubjectTrendSummary | null {
    const chronological = [...items].reverse();
    if (chronological.length < MIN_WEEKS_FOR_TREND) return null;

    const values = chronological.map((item) => item.averageGrade ?? 0);
    const { slope, intercept } = linearRegression(values);
    const classification: SubjectTrendClassification =
      slope > 0.5 ? 'ASCENDING' : slope < -0.5 ? 'DESCENDING' : 'STABLE';

    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 1000) / 1000,
      classification,
      weeksAnalyzed: chronological.length,
    };
  }
}
