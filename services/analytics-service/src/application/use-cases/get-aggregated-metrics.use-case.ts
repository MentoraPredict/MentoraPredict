import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { StudentMetricsEntity } from '../../domain/entities/student-metrics.entity';

interface MetricsOverview {
  periodId?: string;
  totalStudentsWithMetrics: number;
  institutionalAverage: number;
  subjectCount: number;
  generatedAt: Date;
}

interface UserMetrics {
  userId: string;
  periodId: string;
  globalAverage: number;
  subjectAverages: Record<string, number>;
  calculatedAt: Date;
  version: number;
}

interface SubjectMetrics {
  subjectId: string;
  periodId?: string;
  studentsWithMetrics: number;
  classAverage: number;
  passRate: number;
  atRiskCount: number;
  generatedAt: Date;
}

@Injectable()
export class GetAggregatedMetricsUseCase {
  constructor(
    @Inject('IStudentMetricsRepository')
    private readonly metricsRepo: IStudentMetricsRepository,
  ) {}

  async overview(periodId?: string): Promise<MetricsOverview> {
    const metrics = await this.loadMetrics(periodId);
    const subjectIds = new Set(
      metrics.flatMap((metric) => Object.keys(metric.subjectAverages)),
    );

    return {
      periodId,
      totalStudentsWithMetrics: metrics.length,
      institutionalAverage: this.average(metrics.map((metric) => metric.globalAverage)),
      subjectCount: subjectIds.size,
      generatedAt: new Date(),
    };
  }

  async user(userId: string, periodId?: string): Promise<UserMetrics> {
    const metric = periodId
      ? await this.metricsRepo.findByStudentAndPeriod(userId, periodId)
      : await this.metricsRepo.findLatestByStudent(userId);

    if (!metric) {
      throw new NotFoundException('Metrics not found for user');
    }

    return {
      userId,
      periodId: metric.periodId,
      globalAverage: metric.globalAverage,
      subjectAverages: metric.subjectAverages,
      calculatedAt: metric.calculatedAt,
      version: metric.version,
    };
  }

  async subject(subjectId: string, periodId?: string): Promise<SubjectMetrics> {
    const metrics = await this.loadMetrics(periodId);
    const subjectValues = metrics
      .map((metric) => metric.subjectAverages[subjectId])
      .filter((value): value is number => typeof value === 'number');

    if (subjectValues.length === 0) {
      throw new NotFoundException('Metrics not found for subject');
    }

    return {
      subjectId,
      periodId,
      studentsWithMetrics: subjectValues.length,
      classAverage: this.average(subjectValues),
      passRate: this.percentage(subjectValues.filter((value) => value >= 7).length, subjectValues.length),
      atRiskCount: subjectValues.filter((value) => value < 7).length,
      generatedAt: new Date(),
    };
  }

  private async loadMetrics(periodId?: string): Promise<StudentMetricsEntity[]> {
    return periodId
      ? this.metricsRepo.findByPeriod(periodId)
      : this.metricsRepo.findLatestPerStudent();
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
  }

  private percentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 10000) / 100;
  }
}
