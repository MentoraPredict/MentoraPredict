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

  async execute(subjectId: string, teacherId: string): Promise<SubjectRiskCounts> {
    const { isOwner } = await this.academic.getSubjectOwnership(teacherId, subjectId);
    if (!isOwner) {
      throw new ForbiddenException('No tienes acceso a este curso');
    }
    return this.metricsRepo.getRiskCountsBySubject(subjectId);
  }
}
