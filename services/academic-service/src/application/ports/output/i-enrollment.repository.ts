import { EnrollmentEntity } from "../../../domain/entities/enrollment.entity";

export interface IEnrollmentRepository {
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
  save(enrollment: EnrollmentEntity): Promise<EnrollmentEntity>;
}
