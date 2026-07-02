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

// Trend still has no real data source (no historical weekly grade series is
// captured yet), so trendSlope stays neutral — that's still Fase 6/7 scope.
// Compliance/attendance/studyHours now come from WeeklyCheckIn records
// (academic-service, Fase 5) via getLatestCheckIn, averaged across the
// student's ACTIVE enrollments for this period since this snapshot is a
// global-per-period aggregate (subjectId is not part of its signature —
// prediction-service calls GET /internal/risk-snapshot/:studentId/:periodId
// and that contract is out of scope for this phase). Falls back to the
// previous neutral midpoints when the student hasn't submitted any check-in
// yet, so the score isn't silently skewed to zero.
const NEUTRAL_COMPLIANCE = 50;
const NEUTRAL_ATTENDANCE = 50;
const NEUTRAL_TREND_SLOPE = 0;
const NEUTRAL_STUDY_HOURS = 0;
const PASSING_GRADE = 7;

@Injectable()
export class GetRiskSnapshotUseCase {
  constructor(
    private readonly calculateAverageUC: CalculateAverageUseCase,
    private readonly classifyRiskUC: ClassifyRiskUseCase,
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
  ) {}

  async execute(studentId: string, periodId: string, correlationId?: string): Promise<RiskSnapshotResult> {
    const [metrics, grades, enrollments] = await Promise.all([
      this.calculateAverageUC.execute(studentId, periodId, correlationId),
      this.academic.getGradesByStudent(studentId, periodId, correlationId),
      this.academic.getEnrollmentsByStudent(studentId, correlationId),
    ]);

    const failedEvaluations = grades.filter((g) => g.value < PASSING_GRADE).length;

    const activeSubjectIds = enrollments
      .filter((e) => e.periodId === periodId && e.status === 'ACTIVE')
      .map((e) => e.subjectId);

    const checkIns = await Promise.all(
      activeSubjectIds.map((subjectId) =>
        this.academic
          .getLatestCheckIn(studentId, subjectId, periodId, correlationId)
          .catch(() => null),
      ),
    );
    const validCheckIns = checkIns.filter((c): c is NonNullable<typeof c> => c !== null);

    const complianceIndex =
      validCheckIns.length > 0
        ? Math.round(
            (validCheckIns.reduce((s, c) => s + c.taskCompletion, 0) / validCheckIns.length) * 100,
          ) / 100
        : NEUTRAL_COMPLIANCE;
    const attendance =
      validCheckIns.length > 0
        ? Math.round(
            (validCheckIns.filter((c) => c.attendance).length / validCheckIns.length) * 10000,
          ) / 100
        : NEUTRAL_ATTENDANCE;
    const studyHours =
      validCheckIns.length > 0
        ? validCheckIns.reduce((s, c) => s + c.studyHours, 0)
        : NEUTRAL_STUDY_HOURS;

    const { score, riskLevel } = this.classifyRiskUC.execute({
      globalAverage: metrics.globalAverage,
      complianceIndex,
      attendance,
      failedEvaluations,
      trendSlope: NEUTRAL_TREND_SLOPE,
      studyHours,
    });

    return {
      riskLevel,
      score,
      globalAverage: metrics.globalAverage,
      complianceIndex,
      attendance,
      failedEvaluations,
      trendSlope: NEUTRAL_TREND_SLOPE,
    };
  }
}
