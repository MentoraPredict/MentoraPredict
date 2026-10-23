import {
  StudentEnrollment,
  StudentEnrollmentStatus,
} from '../../../domain/entities/people.entity';

export const STUDENT_ENROLLMENT_REPOSITORY_TOKEN = 'IStudentEnrollmentRepository';

export interface SectionCourse {
  id: string;
  academicPeriodId: string;
}

export interface IStudentEnrollmentRepository {
  findById(id: string): Promise<StudentEnrollment | null>;
  findActive(studentId: string, schoolYearId: string): Promise<StudentEnrollment | null>;
  listBySection(sectionId: string, status?: StudentEnrollmentStatus): Promise<StudentEnrollment[]>;
  listByStudent(studentId: string): Promise<StudentEnrollment[]>;
  countActiveInSection(sectionId: string): Promise<number>;
  save(enrollment: StudentEnrollment): Promise<StudentEnrollment>;
  update(enrollment: StudentEnrollment): Promise<StudentEnrollment>;

  /** Asignaturas (filas de `subjects`) ofertadas en un paralelo. */
  listSectionCourses(sectionId: string): Promise<SectionCourse[]>;
  /** Marca como WITHDRAWN las matrículas por asignatura activas del estudiante en el paralelo. */
  withdrawCourseEnrollments(studentId: string, sectionId: string): Promise<number>;
}
