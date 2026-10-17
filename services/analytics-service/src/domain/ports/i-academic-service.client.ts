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

/** Asistencia registrada por el docente: % de clases a las que asistió. */
export interface AttendanceRateSummary {
  attendance: number;
  held: number;
}

export interface SubjectOwnership {
  isOwner: boolean;
}

export interface SubjectDetails {
  id: string;
  name: string;
  teacherId: string | null;
  isActive: boolean;
}

export interface PeriodDetails {
  id: string;
  status: string;
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
  /** null si el docente aún no registró asistencia de ese estudiante en la asignatura. */
  getAttendanceRate(
    studentId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<AttendanceRateSummary | null>;
  getSubjectOwnership(
    teacherId: string,
    subjectId: string,
    correlationId?: string,
  ): Promise<SubjectOwnership>;
  getSubjectDetails(subjectId: string, correlationId?: string): Promise<SubjectDetails | null>;
  getPeriodDetails(periodId: string, correlationId?: string): Promise<PeriodDetails | null>;
  getStudentsByTeacher(
    teacherId: string,
    periodId: string,
    correlationId?: string,
  ): Promise<string[]>;
}
