import { Injectable, Logger } from '@nestjs/common';
import { CalculateAverageUseCase } from './calculate-average.use-case';

@Injectable()
export class RecalculateStudentMetricsUseCase {
  private readonly logger = new Logger(RecalculateStudentMetricsUseCase.name);

  constructor(private readonly calculateAverageUC: CalculateAverageUseCase) {}

  async execute(
    periodId: string,
    studentIds: string[],
  ): Promise<{ processed: number; errors: string[] }> {
    let processed = 0;
    const errors: string[] = [];

    for (const studentId of studentIds) {
      try {
        await this.calculateAverageUC.execute(studentId, periodId);
        processed++;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        errors.push(`${studentId}: ${reason}`);
        this.logger.warn(`Recalculate failed for student ${studentId}: ${reason}`);
      }
    }

    return { processed, errors };
  }
}
