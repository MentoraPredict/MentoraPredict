import { Inject, Injectable } from '@nestjs/common';
import { CalculateAverageUseCase } from './calculate-average.use-case';
import { ClassifyRiskUseCase, RiskLevel } from './classify-risk.use-case';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';

export interface RiskSnapshotResult {
  riskLevel: RiskLevel;
  score: number;
  globalAverage: number;
  complianceIndex: number;
  attendance: number;
  failedEvaluations: number;
  trendSlope: number;
}

// Compliance, attendance and trend cannot be derived automatically yet —
// the platform does not capture asistencia/tareas/participacion data points
// anywhere (RF-017's CalculateComplianceUseCase requires them as manual
// input, see analytics.controller.ts). Until that data exists, this
// snapshot uses neutral midpoint values for those three components so the
// risk score is not silently skewed by zeros, and documents the gap instead
// of fabricating numbers.
// C-09: complianceIndex/attendance/trendSlope con valores neutros (50) documentados con comentario.
// La pendiente de la tendencia en 0 da un componente de tendencia neutro de 50 en la clasificación de riesgo.
const NEUTRAL_COMPLIANCE = 50;
const NEUTRAL_ATTENDANCE = 50;
const NEUTRAL_TREND_SLOPE = 0;
const PASSING_GRADE = 7;

@Injectable()
export class GetRiskSnapshotUseCase {
  constructor(
    private readonly calculateAverageUC: CalculateAverageUseCase,
    private readonly classifyRiskUC: ClassifyRiskUseCase,
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(studentId: string, periodId: string, correlationId?: string): Promise<RiskSnapshotResult> {
    const [metrics, grades] = await Promise.all([
      this.calculateAverageUC.execute(studentId, periodId, correlationId),
      this.academic.getGradesByStudent(studentId, periodId, correlationId),
    ]);

    const failedEvaluations = grades.filter((g) => g.value < PASSING_GRADE).length;

    const { score, riskLevel } = this.classifyRiskUC.execute({
      globalAverage: metrics.globalAverage,
      complianceIndex: NEUTRAL_COMPLIANCE,
      attendance: NEUTRAL_ATTENDANCE,
      failedEvaluations,
      trendSlope: NEUTRAL_TREND_SLOPE,
      studyHours: 0,
    });

    return {
      riskLevel,
      score,
      globalAverage: metrics.globalAverage,
      complianceIndex: NEUTRAL_COMPLIANCE,
      attendance: NEUTRAL_ATTENDANCE,
      failedEvaluations,
      trendSlope: NEUTRAL_TREND_SLOPE,
    };
  }
}
