import { PredictionResult } from '../entities/prediction-result.entity';

export interface IPredictionLogRepository {
  save(result: PredictionResult): Promise<void>;
  // subjectId omitted/null -> global (all-subjects) predictions only.
  // subjectId set -> predictions scoped to exactly that subject.
  findHistory(studentId: string, limit?: number, subjectId?: string | null): Promise<PredictionResult[]>;
}
