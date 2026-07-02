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
  evaluationId: string | null;
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
      const subject = await this.subjectRepo.findById(enrollment.subjectId);
      // Return ALL grades per subject (one per evaluation) so analytics can compute weighted averages
      const grades = await this.gradeRepo.findAllByStudentAndSubject(studentId, enrollment.subjectId);
      for (const grade of grades) {
        views.push({
          id: grade.id,
          studentId,
          subjectId: enrollment.subjectId,
          subjectName: subject?.name ?? '',
          subjectCredits: subject?.credits ?? 1,
          value: grade.value,
          periodId,
          evaluationId: grade.evaluationId,
        });
      }
    }

    return views;
  }
}
