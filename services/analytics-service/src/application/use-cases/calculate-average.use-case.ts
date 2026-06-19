import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { IMetricsCachePort } from '../../domain/ports/i-metrics-cache.port';
import { StudentMetricsEntity } from '../../domain/entities/student-metrics.entity';
import { Grade } from '../../domain/entities/grade.vo';

const CACHE_TTL = 300;

@Injectable()
export class CalculateAverageUseCase {
  constructor(
    @Inject('IAcademicServiceClient')  private readonly academic: IAcademicServiceClient,
    @Inject('IStudentMetricsRepository') private readonly metricsRepo: IStudentMetricsRepository,
    @Inject('IMetricsCachePort')        private readonly cache: IMetricsCachePort,
  ) {}

  async execute(studentId: string, periodId: string, correlationId?: string): Promise<StudentMetricsEntity> {
    const cacheKey = `metrics:${studentId}:${periodId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as StudentMetricsEntity;

    const grades = await this.academic.getGradesByStudent(studentId, periodId, correlationId);
    const subjectAverages = this.averageBySubject(grades);
    const globalAverage = this.weightedGlobalAverage(grades);

    const previous = await this.metricsRepo.findByStudentAndPeriod(studentId, periodId);
    const version = (previous?.version ?? 0) + 1;

    const metrics = new StudentMetricsEntity(
      randomUUID(),
      studentId,
      periodId,
      subjectAverages,
      globalAverage,
      new Date(),
      version,
    );

    const saved = await this.metricsRepo.save(metrics);
    await this.cache.set(cacheKey, JSON.stringify(saved), CACHE_TTL);
    return saved;
  }

  private averageBySubject(grades: Grade[]): Record<string, number> {
    const sums: Record<string, { total: number; count: number }> = {};
    for (const g of grades) {
      if (!sums[g.subjectId]) sums[g.subjectId] = { total: 0, count: 0 };
      sums[g.subjectId].total += g.value;
      sums[g.subjectId].count += 1;
    }
    return Object.fromEntries(
      Object.entries(sums).map(([id, { total, count }]) => [id, total / count]),
    );
  }

  private weightedGlobalAverage(grades: Grade[]): number {
    if (grades.length === 0) return 0;
    let weighted = 0;
    let credits = 0;
    for (const g of grades) {
      const w = g.subjectCredits > 0 ? g.subjectCredits : 1;
      weighted += g.value * w;
      credits += w;
    }
    return Math.round((weighted / credits) * 100) / 100;
  }
}
