import { Grade } from '../entities/grade.vo';
import { Enrollment } from '../entities/enrollment.vo';

export interface EvaluationWeight {
  id: string;
  weight: number;
  isActive: boolean;
}

export interface CheckInSummary {
  attendance: boolean;
  taskCompletion: number;
  studyHours: number;
}

export interface IAcademicServiceClient {
  getGradesByStudent(studentId: string, periodId: string, correlationId?: string): Promise<Grade[]>;
  getEnrollmentsByStudent(studentId: string, correlationId?: string): Promise<Enrollment[]>;
  getEvaluationsBySubject(subjectId: string, correlationId?: string): Promise<EvaluationWeight[]>;
  getLatestCheckIn(
    studentId: string,
    subjectId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<CheckInSummary | null>;
}
