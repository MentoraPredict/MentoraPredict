import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { IDatasetVersionRepository } from '../../domain/ports/i-dataset-version.repository';
import { linearRegression } from '../../infrastructure/wasm/linear-regression.wasm';

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

    const { slope, intercept } = linearRegression(averages);

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
