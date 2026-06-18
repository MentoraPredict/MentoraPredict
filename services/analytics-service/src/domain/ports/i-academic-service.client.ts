import { Grade } from '../entities/grade.vo';
import { Enrollment } from '../entities/enrollment.vo';

export interface IAcademicServiceClient {
  getGradesByStudent(studentId: string, periodId: string, correlationId?: string): Promise<Grade[]>;
  getEnrollmentsByStudent(studentId: string, correlationId?: string): Promise<Enrollment[]>;
}
