import { StudentSubjectPredictionEntity } from '../entities/student-subject-prediction.entity';

export interface IStudentSubjectPredictionRepository {
  // Atomic upsert on (studentId, subjectId, academicWeek, academicYear) via ON CONFLICT —
  // same pattern as weekly_check_ins/student_subject_metrics in earlier phases.
  upsert(prediction: StudentSubjectPredictionEntity): Promise<StudentSubjectPredictionEntity>;
  findLatestByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<StudentSubjectPredictionEntity | null>;
  // Latest prediction per student in the subject (one row per student), paginated.
  findLatestBySubjectPaginated(
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectPredictionEntity[]; total: number }>;
}
