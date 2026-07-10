import { Inject, Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';

@Injectable()
export class CheckSubjectOwnershipUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
  ) {}

  async execute(subjectId: string, teacherId: string): Promise<{ isOwner: boolean }> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) return { isOwner: false };

    // Same lookup used inline by GetSubjectEnrollmentsUseCase, GetCheckInsSummaryUseCase
    // and ImportSubjectGradesUseCase — subject_teachers is scoped by the subject's own
    // academic period, not an arbitrary one.
    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    return { isOwner: !!assignment };
  }
}
