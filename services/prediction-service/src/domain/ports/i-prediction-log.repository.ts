import { PredictionResult } from '../entities/prediction-result.entity';

export interface IPredictionLogRepository {
  save(result: PredictionResult): Promise<void>;
  findHistory(studentId: string, limit?: number): Promise<PredictionResult[]>;
}
