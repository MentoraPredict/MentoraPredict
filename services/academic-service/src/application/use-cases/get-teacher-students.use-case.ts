import { Inject, Injectable } from '@nestjs/common';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';

const SUBJECTS_LIMIT = 500;
const ENROLLMENTS_LIMIT = 500;

@Injectable()
export class GetTeacherStudentsUseCase {
  constructor(
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(teacherId: string, periodId: string): Promise<string[]> {
    const { items: subjects } = await this.subjectTeacherRepo.findByTeacherIdWithDetails(
      teacherId,
      { periodId },
      { page: 1, limit: SUBJECTS_LIMIT },
    );

    const enrollmentLists = await Promise.all(
      subjects.map((subject) =>
        this.enrollmentRepo.findBySubjectIdPaginated(
          subject.id,
          { status: 'ACTIVE' },
          { page: 1, limit: ENROLLMENTS_LIMIT },
        ),
      ),
    );

    const studentIds = new Set<string>();
    for (const { items } of enrollmentLists) {
      for (const enrollment of items) {
        studentIds.add(enrollment.studentId);
      }
    }

    return [...studentIds];
  }
}
