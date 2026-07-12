import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IStudentSubjectMetricsRepository, SubjectRiskCounts } from '../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';

@Injectable()
export class GetSubjectMetricsSummaryUseCase {
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
  ): Promise<SubjectRiskCounts & { averageGrade: number | null }> {
    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.academic.getSubjectOwnership(callerId, subjectId);
      if (!isOwner) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    }

    const [riskCounts, averageGrade] = await Promise.all([
      this.metricsRepo.getRiskCountsBySubject(subjectId),
      this.metricsRepo.getAverageGradeBySubject(subjectId),
    ]);

    return { ...riskCounts, averageGrade };
  }
}
