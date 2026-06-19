import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { IDatasetVersionRepository } from '../../domain/ports/i-dataset-version.repository';

export type TrendClassification = 'ASCENDING' | 'STABLE' | 'DESCENDING';

export interface TrendResult {
  slope: number;
  intercept: number;
  classification: TrendClassification;
  periodsAnalyzed: number;
}

@Injectable()
export class CalculateTrendUseCase {
  constructor(
    @Inject('IStudentMetricsRepository')  private readonly metricsRepo: IStudentMetricsRepository,
    @Inject('IDatasetVersionRepository') private readonly datasetRepo: IDatasetVersionRepository,
  ) {}

  async execute(studentId: string, periodIds: string[]): Promise<TrendResult> {
    if (periodIds.length < 3) {
      throw new BadRequestException('At least 3 periods are required for trend analysis');
    }

    const averages: number[] = [];
    for (const periodId of periodIds) {
      const m = await this.metricsRepo.findByStudentAndPeriod(studentId, periodId);
      averages.push(m?.globalAverage ?? 0);
    }

    const points = averages.map((y, i) => ({ x: i + 1, y }));
    const { slope, intercept } = linearRegression(points);

    const classification: TrendClassification =
      slope > 0.5 ? 'ASCENDING' : slope < -0.5 ? 'DESCENDING' : 'STABLE';

    const result: TrendResult = {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 1000) / 1000,
      classification,
      periodsAnalyzed: periodIds.length,
    };

    await this.datasetRepo.save({
      studentId,
      type: 'trend',
      inputs: { periodIds, averages },
      result: result as unknown as Record<string, unknown>,
      timestamp: new Date(),
    });

    return result;
  }
}

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
