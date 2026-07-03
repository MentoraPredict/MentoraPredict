import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { IEnrollmentRepository } from '../ports/output/i-enrollment.repository';
import { WeeklyCheckInEntity } from '../../domain/entities/weekly-check-in.entity';

@Injectable()
export class ListCheckInsUseCase {
  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
    @Inject('IEnrollmentRepository') private readonly enrollmentRepo: IEnrollmentRepository,
  ) {}

  async execute(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ data: WeeklyCheckInEntity[]; total: number; page: number; limit: number }> {
    const enrollment = await this.enrollmentRepo.findByStudentAndSubject(studentId, subjectId);
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenException('No estás matriculado activo en este curso');
    }

    const { items, total } = await this.checkInRepo.findByStudentSubjectPaginated(
      studentId,
      subjectId,
      pagination,
    );

    return { data: items, total, page: pagination.page, limit: pagination.limit };
  }
}
