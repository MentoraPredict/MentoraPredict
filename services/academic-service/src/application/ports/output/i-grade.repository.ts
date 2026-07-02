import { GradeEntity } from "../../../domain/entities/grade.entity";

export interface IGradeRepository {
  findById(id: string): Promise<GradeEntity | null>;
  findByStudentAndEvaluation(
    studentId: string,
    evaluationId: string,
  ): Promise<GradeEntity | null>;
  findByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<GradeEntity | null>;
  findAllByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<GradeEntity[]>;
  findByStudentId(studentId: string): Promise<GradeEntity[]>;
  findByEvaluationId(evaluationId: string): Promise<GradeEntity[]>;
  save(grade: GradeEntity): Promise<GradeEntity>;
  update(grade: GradeEntity): Promise<GradeEntity>;
}
