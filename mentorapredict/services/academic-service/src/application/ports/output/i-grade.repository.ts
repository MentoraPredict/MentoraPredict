import { GradeEntity } from '../../../domain/entities/grade.entity';

export interface IGradeRepository {
  findByStudentAndEvaluation(studentId: string, evaluationId: string): Promise<GradeEntity | null>;
  findByStudentId(studentId: string): Promise<GradeEntity[]>;
  findByEvaluationId(evaluationId: string): Promise<GradeEntity[]>;
  save(grade: GradeEntity): Promise<GradeEntity>;
}
