import { Inject, Injectable } from '@nestjs/common';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';

export interface LatestCheckInSummary {
  attendance: boolean;
  taskCompletion: number;
  studyHours: number;
}

@Injectable()
export class GetLatestCheckInUseCase {
  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
  ) {}

  async execute(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<LatestCheckInSummary | null> {
    const checkIn = await this.checkInRepo.findLatestByStudentSubject(studentId, subjectId, periodId);
    if (!checkIn) return null;
    return {
      attendance: checkIn.attendance,
      taskCompletion: checkIn.taskCompletion,
      studyHours: checkIn.studyHours,
    };
  }
}
