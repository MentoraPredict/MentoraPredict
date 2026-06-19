import { Inject, Injectable } from '@nestjs/common';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

export interface StudentEnrollmentView {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  subjectCredits: number;
  periodId: string;
  status: string;
}

@Injectable()
export class GetStudentEnrollmentsUseCase {
  constructor(
    @Inject('IEnrollmentRepository') private readonly enrollRepo: IEnrollmentRepository,
    @Inject('ISubjectRepository')    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(studentId: string): Promise<StudentEnrollmentView[]> {
    const enrollments = await this.enrollRepo.findByStudentId(studentId);
    const views: StudentEnrollmentView[] = [];

    for (const e of enrollments) {
      const subject = await this.subjectRepo.findById(e.subjectId);
      views.push({
        id: e.id,
        studentId,
        subjectId: e.subjectId,
        subjectName: subject?.name ?? '',
        subjectCredits: subject?.credits ?? 1,
        periodId: e.periodId,
        status: e.status,
      });
    }

    return views;
  }
}
