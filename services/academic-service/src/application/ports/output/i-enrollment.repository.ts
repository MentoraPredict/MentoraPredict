import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';

export interface StudentSubjectRawRow {
  enrollmentId: string;
  studentId: string;
  status: string;
  enrolledAt: Date;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectDescription: string;
  credits: number;
  maxCapacity: number;
  teacherId: string | null;
  careerId: string;
  careerName: string;
  periodId: string;
  periodName: string;
  periodStatus: string;
}

export interface IEnrollmentRepository {
  findById(id: string): Promise<EnrollmentEntity | null>;
  findByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<EnrollmentEntity | null>;
  findByStudentSubjectAndPeriod(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<EnrollmentEntity | null>;
  countActiveBySubject(subjectId: string): Promise<number>;
  findByStudentId(studentId: string): Promise<EnrollmentEntity[]>;
  findBySubjectIdPaginated(
    subjectId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: EnrollmentEntity[]; total: number }>;
  findByStudentIdWithDetails(
    studentId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectRawRow[]; total: number }>;
  save(enrollment: EnrollmentEntity): Promise<EnrollmentEntity>;
  update(enrollment: EnrollmentEntity): Promise<EnrollmentEntity>;
  saveWithCapacityCheck(
    enrollment: EnrollmentEntity,
    maxCapacity: number,
  ): Promise<'enrolled' | 'at_capacity' | 'already_enrolled'>;
}
