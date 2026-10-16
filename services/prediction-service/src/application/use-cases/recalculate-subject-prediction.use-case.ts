import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ANALYTICS_CLIENT, ACADEMIC_CONTEXT_CLIENT } from './generate-prediction.use-case';
import { IAnalyticsClient, LatestSubjectMetric } from '../ports/output/i-analytics.client';
import { IAcademicContextClient } from '../ports/output/i-academic-context.client';
import { IUserServiceClient } from '../ports/output/i-user-service.client';
import {
  PredictedRiskLevel,
  StudentSubjectPredictionEntity,
} from '../../domain/entities/student-subject-prediction.entity';
import { IStudentSubjectPredictionRepository } from '../../domain/ports/i-student-subject-prediction.repository';
import { getAcademicWeek } from '../../infrastructure/utils/academic-week.util';

export const STUDENT_SUBJECT_PREDICTION_REPO = 'IStudentSubjectPredictionRepository';
export const USER_SERVICE_CLIENT = 'IUserServiceClient';

// Weakest-factor comparison threshold for a "sustained decline" callout.
const TREND_DECLINE_THRESHOLD = -0.3;

@Injectable()
export class RecalculateSubjectPredictionUseCase {
  private readonly logger = new Logger(RecalculateSubjectPredictionUseCase.name);

  constructor(
    @Inject(ANALYTICS_CLIENT) private readonly analyticsClient: IAnalyticsClient,
    @Inject(ACADEMIC_CONTEXT_CLIENT) private readonly academicClient: IAcademicContextClient,
    @Inject(USER_SERVICE_CLIENT) private readonly userClient: IUserServiceClient,
    @Inject(STUDENT_SUBJECT_PREDICTION_REPO)
    private readonly predictionRepo: IStudentSubjectPredictionRepository,
  ) {}

  async execute(studentId: string, subjectId: string, periodId: string): Promise<StudentSubjectPredictionEntity> {
    // Prediction-service asks analytics-service for what it needs — it never
    // receives already-computed risk/trend data pushed in the trigger body.
    // The profile/subject/period fetches double as the reference-table sync
    // (see docs/database/entity-relationship-diagram.md §3) — this is the
    // only write path into student_subject_predictions, so it's the natural
    // (and only) place in prediction-service to keep those caches fresh.
    const [metric, profile, subject, period] = await Promise.all([
      this.analyticsClient.getLatestSubjectMetric(studentId, subjectId),
      this.userClient.getProfile(studentId),
      this.academicClient.getSubjectDetails(subjectId),
      this.academicClient.getPeriodDetails(periodId),
    ]);

    const now = new Date();
    const { academicWeek, academicYear } = getAcademicWeek(now);

    // A failed fetch (null) is treated as "unknown" and never blocks a
    // recalculation on its own — only an explicit inactive/cancelled value
    // does. Same best-effort philosophy as the reference-table sync itself.
    const noLongerEligible =
      profile?.status === 'INACTIVE' || subject?.isActive === false || period?.status === 'CANCELLED';
    if (noLongerEligible) {
      this.logger.warn(
        `Skipping prediction computation for student ${studentId} / subject ${subjectId}: ` +
          'student/subject inactive or period cancelled',
      );
    }

    // Same criterion as Fase 7's trendSlope null-ability: fewer than 2 weeks
    // of graded history means there isn't enough signal for a real
    // prediction, and a null riskLevel this week (no check-in / no grade)
    // must never be silently narrated as "COMPUTED".
    const insufficientData =
      noLongerEligible || !metric || metric.riskLevel === null || metric.trendSlope === null;

    const entity = new StudentSubjectPredictionEntity(
      randomUUID(),
      studentId,
      subjectId,
      periodId,
      academicWeek,
      academicYear,
      insufficientData ? 'INSUFFICIENT_DATA' : 'COMPUTED',
      insufficientData ? null : (metric as LatestSubjectMetric).riskLevel as PredictedRiskLevel,
      insufficientData ? null : (metric as LatestSubjectMetric).trendSlope,
      insufficientData ? null : this.buildRecommendation(metric as LatestSubjectMetric),
      now,
    );

    const saved = await this.predictionRepo.upsert(entity);
    this.logger.log(`Prediction ${saved.status} for student ${studentId} / subject ${subjectId}`);
    return saved;
  }

  // Rule-based, no ML: picks the single weakest signal among the factors
  // analytics-service already computed and turns it into one short sentence.
  private buildRecommendation(metric: LatestSubjectMetric): string | null {
    const { complianceIndex, attendanceRate, comprehensionAvg, trendSlope, riskLevel } = metric;

    // complianceIndex/attendanceRate/comprehensionAvg share the same 0-100
    // scale, so comparing them directly is meaningful. studyHours is left out
    // of this comparison — it's on a different scale (raw hours) and has no
    // dedicated rule in this phase's spec.
    const scored: { key: 'compliance' | 'attendance' | 'comprehension'; value: number }[] = [];
    if (complianceIndex !== null) scored.push({ key: 'compliance', value: complianceIndex });
    if (attendanceRate !== null) scored.push({ key: 'attendance', value: attendanceRate });
    if (comprehensionAvg !== null) scored.push({ key: 'comprehension', value: comprehensionAvg });

    if (scored.length > 0) {
      scored.sort((a, b) => a.value - b.value);
      const weakest = scored[0];
      if (weakest.key === 'compliance') {
        return `Cumplimiento de tareas bajo (${complianceIndex}%) — enfócate en completar las tareas pendientes de esta materia.`;
      }
      if (weakest.key === 'attendance') {
        return `Asistencia baja (${attendanceRate}%) — mejorar la asistencia a clases ayudará a sostener el rendimiento.`;
      }
      return `Comprensión general baja (${comprehensionAvg}%) — repasa los temas recientes o consulta tus dudas con el docente.`;
    }

    if (trendSlope !== null && trendSlope < TREND_DECLINE_THRESHOLD) {
      return `El promedio viene en declive sostenido (pendiente ${trendSlope}) — revisa qué cambió en las últimas semanas.`;
    }

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      return `Los indicadores puntuales están dentro de rango, pero el riesgo académico es ${riskLevel} — mantente atento y busca apoyo si lo necesitas.`;
    }

    return null;
  }
}
