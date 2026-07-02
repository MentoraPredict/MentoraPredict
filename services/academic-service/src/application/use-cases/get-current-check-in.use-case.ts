import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { WeeklyCheckInEntity } from '../../domain/entities/weekly-check-in.entity';
import { getAcademicWeek } from '../../infrastructure/utils/academic-week.util';

@Injectable()
export class GetCurrentCheckInUseCase {
  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<WeeklyCheckInEntity | null> {
    const enrollment = await this.enrollmentRepo.findByStudentAndSubject(studentId, subjectId);
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenException('No estás matriculado activo en este curso');
    }

    const { academicWeek, academicYear } = getAcademicWeek(new Date());
    return this.checkInRepo.findByStudentSubjectWeek(studentId, subjectId, academicWeek, academicYear);
  }
}
