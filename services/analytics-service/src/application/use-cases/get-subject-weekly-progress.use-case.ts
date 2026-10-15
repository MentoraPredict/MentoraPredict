import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  IStudentSubjectMetricsRepository,
  SubjectWeeklyProgress,
} from '../../domain/ports/i-student-subject-metrics.repository';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { linearRegression } from '../../infrastructure/wasm/linear-regression.wasm';
import { SubjectTrendClassification, SubjectTrendSummary } from './get-student-subject-metrics.use-case';

const MIN_WEEKS_FOR_TREND = 3;

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
  ): Promise<{ data: SubjectWeeklyProgress[]; trend: SubjectTrendSummary | null }> {
    if (callerRole !== 'ADMIN') {
      const { isOwner } = await this.academic.getSubjectOwnership(callerId, subjectId);
      if (!isOwner) {
        throw new ForbiddenException('No tienes acceso a este curso');
      }
    }

    const data = await this.metricsRepo.getWeeklyProgressBySubject(subjectId);
    return { data, trend: this.calculateTrend(data) };
  }

  // Mismo criterio que GetStudentSubjectMetricsUseCase.calculateTrend() —
  // getWeeklyProgressBySubject ya devuelve las filas ordenadas ASC
  // (academic_year, academic_week), así que no hace falta revertir el orden.
  private calculateTrend(data: SubjectWeeklyProgress[]): SubjectTrendSummary | null {
    if (data.length < MIN_WEEKS_FOR_TREND) return null;

    const values = data.map((point) => point.averageGrade ?? 0);
    const { slope, intercept } = linearRegression(values);
    const classification: SubjectTrendClassification =
      slope > 0.5 ? 'ASCENDING' : slope < -0.5 ? 'DESCENDING' : 'STABLE';

    return {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 1000) / 1000,
      classification,
      weeksAnalyzed: data.length,
    };
  }
}
