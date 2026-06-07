import { EvaluationEntity } from '../../../domain/entities/evaluation.entity';

export interface IEvaluationRepository {
  findById(id: string): Promise<EvaluationEntity | null>;
  findBySubjectId(subjectId: string): Promise<EvaluationEntity[]>;
  getTotalWeightForSubject(subjectId: string): Promise<number>;
  save(evaluation: EvaluationEntity): Promise<EvaluationEntity>;
}
