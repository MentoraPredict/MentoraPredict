import { SubjectTeacherEntity } from '../../../domain/entities/subject-teacher.entity';

export interface ISubjectTeacherRepository {
  findBySubjectTeacherAndPeriod(
    subjectId: string, teacherId: string, periodId: string,
  ): Promise<SubjectTeacherEntity | null>;
  save(assignment: SubjectTeacherEntity): Promise<SubjectTeacherEntity>;
}
