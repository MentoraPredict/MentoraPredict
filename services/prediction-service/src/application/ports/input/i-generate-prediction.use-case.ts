import { PredictionResult } from '../../../domain/entities/prediction-result.entity';

export interface IGeneratePredictionUseCase {
  execute(studentId: string, periodId: string): Promise<PredictionResult>;
}
