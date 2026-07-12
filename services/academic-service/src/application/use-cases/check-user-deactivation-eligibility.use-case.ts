import { Inject, Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';

export interface DeactivationEligibility {
  canDeactivate: boolean;
  reason?: string;
}

@Injectable()
export class CheckUserDeactivationEligibilityUseCase {
  constructor(
    @Inject('IEnrollmentRepository')
    private readonly enrollments: IEnrollmentRepository,
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeachers: ISubjectTeacherRepository,
  ) {}

  async execute(userId: string, role: string): Promise<DeactivationEligibility> {
    if (role === 'TEACHER') {
      const hasActiveCourse = await this.subjectTeachers.hasActiveCourseAssignment(userId);
      return hasActiveCourse
        ? {
            canDeactivate: false,
            reason: 'No se puede desactivar al docente porque tiene al menos un curso activo asignado.',
          }
        : { canDeactivate: true };
    }

    if (role === 'STUDENT') {
      const hasActiveEnrollment = await this.enrollments.hasActiveEnrollmentInActiveCourse(userId);
      return hasActiveEnrollment
        ? {
            canDeactivate: false,
            reason: 'No se puede desactivar al estudiante porque tiene al menos una matrícula activa en un curso activo.',
          }
        : { canDeactivate: true };
    }

    return { canDeactivate: true };
  }
}
