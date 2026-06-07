import { EnrollmentEntity } from '../../../domain/entities/enrollment.entity';

export interface IEnrollmentRepository {
  findByStudentAndSubject(studentId: string, subjectId: string): Promise<EnrollmentEntity | null>;
  findByStudentId(studentId: string): Promise<EnrollmentEntity[]>;
  save(enrollment: EnrollmentEntity): Promise<EnrollmentEntity>;
}
