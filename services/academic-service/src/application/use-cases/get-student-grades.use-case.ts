import { Inject, Injectable } from '@nestjs/common';
import { IGradeRepository } from '../ports/output/i-grade.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

export interface StudentGradeView {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  subjectCredits: number;
  value: number;
  periodId: string;
}

@Injectable()
export class GetStudentGradesUseCase {
  constructor(
    @Inject('IGradeRepository')      private readonly gradeRepo: IGradeRepository,
    @Inject('IEnrollmentRepository') private readonly enrollRepo: IEnrollmentRepository,
    @Inject('ISubjectRepository')    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(studentId: string, periodId: string): Promise<StudentGradeView[]> {
    const enrollments = await this.enrollRepo.findByStudentId(studentId);
    const active = enrollments.filter((e) => e.periodId === periodId && e.status === 'ACTIVE');
    const views: StudentGradeView[] = [];

    for (const enrollment of active) {
      const grade = await this.gradeRepo.findByStudentAndSubject(studentId, enrollment.subjectId);
      if (!grade) continue;
      const subject = await this.subjectRepo.findById(enrollment.subjectId);
      views.push({
        id: grade.id,
        studentId,
        subjectId: enrollment.subjectId,
        subjectName: subject?.name ?? '',
        subjectCredits: subject?.credits ?? 1,
        value: grade.value,
        periodId,
      });
    }

    return views;
  }
}
