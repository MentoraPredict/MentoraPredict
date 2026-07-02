import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';
import { IWeeklyCheckInRepository, CheckInWeekSummaryRow } from '../ports/output/i-weekly-check-in.repository';

@Injectable()
export class GetCheckInsSummaryUseCase {
  constructor(
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
    @Inject('ISubjectTeacherRepository') private readonly subjectTeacherRepo: ISubjectTeacherRepository,
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
  ) {}

  async execute(subjectId: string, teacherId: string): Promise<CheckInWeekSummaryRow[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const assignment = await this.subjectTeacherRepo.findBySubjectTeacherAndPeriod(
      subjectId,
      teacherId,
      subject.academicPeriodId,
    );
    if (!assignment) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }

    return this.checkInRepo.getWeeklySummaryBySubject(subjectId);
  }
}
