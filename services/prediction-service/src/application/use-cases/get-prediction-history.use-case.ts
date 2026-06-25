import { Inject, Injectable } from '@nestjs/common';
import { PredictionResult } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { PREDICTION_LOG_REPO } from './generate-prediction.use-case';

@Injectable()
export class GetPredictionHistoryUseCase {
  constructor(
    @Inject(PREDICTION_LOG_REPO) private readonly logRepo: IPredictionLogRepository,
  ) {}

  execute(studentId: string, limit?: number): Promise<PredictionResult[]> {
    return this.logRepo.findHistory(studentId, limit);
  }
}
