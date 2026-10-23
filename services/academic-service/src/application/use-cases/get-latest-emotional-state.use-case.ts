import { Inject, Injectable } from '@nestjs/common';
import { IWeeklyCheckInRepository } from '../ports/output/i-weekly-check-in.repository';
import { EmotionalState } from '../../domain/entities/weekly-check-in.entity';

export interface LatestEmotionalState {
  emotionalState: EmotionalState;
  academicWeek: number;
  academicYear: number;
}

/** Estado emocional del último registro semanal del estudiante en una materia. */
@Injectable()
export class GetLatestEmotionalStateUseCase {
  constructor(
    @Inject('IWeeklyCheckInRepository') private readonly checkInRepo: IWeeklyCheckInRepository,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<LatestEmotionalState | null> {
    const { items } = await this.checkInRepo.findByStudentSubjectPaginated(studentId, subjectId, {
      page: 1,
      limit: 1,
    });
    const latest = items[0];
    if (!latest) return null;

    return {
      emotionalState: latest.emotionalState,
      academicWeek: latest.academicWeek,
      academicYear: latest.academicYear,
    };
  }
}