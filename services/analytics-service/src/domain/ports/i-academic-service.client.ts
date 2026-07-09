import { Grade } from '../entities/grade.vo';
import { Enrollment } from '../entities/enrollment.vo';

export interface EvaluationWeight {
  id: string;
  weight: number;
  isActive: boolean;
}

export interface CheckInSummary {
  attendance: number;
  taskCompletion: number;
  studyHours: number;
  generalComprehension: number;
  topicComprehensionAvg: number | null;
}

export interface SubjectOwnership {
  isOwner: boolean;
}

export interface SubjectDetails {
  id: string;
  name: string;
  teacherId: string | null;
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
  getSubjectOwnership(
    teacherId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<SubjectOwnership>;
  getSubjectDetails(subjectId: string, correlationId?: string): Promise<SubjectDetails | null>;
  getStudentsByTeacher(
    teacherId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<string[]>;
}
