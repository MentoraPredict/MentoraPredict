import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IStudentSubjectMetricsRepository,
  SubjectWeeklyProgress,
} from '../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';

@Injectable()
export class GetSubjectWeeklyProgressUseCase {
  constructor(
    @Inject('IStudentSubjectMetricsRepository')
    private readonly metricsRepo: IStudentSubjectMetricsRepository,
    @Inject('IAcademicServiceClient')
    private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(
    subjectId: string,
    callerId: string,
    callerRole: string,
  ): Promise<SubjectWeeklyProgress[]> {
    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.academic.getSubjectOwnership(callerId, subjectId);
      if (!isOwner) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    }

    return this.metricsRepo.getWeeklyProgressBySubject(subjectId);
  }
}
