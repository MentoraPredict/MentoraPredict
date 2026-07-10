import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PredictionResult, RecommendationItem, RiskSnapshot } from '../../domain/entities/prediction-result.entity';
import { IAnalyticsClient } from '../ports/output/i-analytics.client';
import { IAcademicContextClient } from '../ports/output/i-academic-context.client';
import { IAiRecommendationProvider } from '../ports/output/i-ai-recommendation.provider';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import {
  ANALYTICS_CLIENT,
  ACADEMIC_CONTEXT_CLIENT,
  AI_PROVIDER,
  PREDICTION_LOG_REPO,
} from './generate-prediction.use-case';

const MODEL_VERSION = 'gpt-recommendation-v1';

// Per-subject counterpart of GeneratePredictionUseCase: grounds the AI
// recommendation in ONE subject's weekly-progress metrics (check-in derived)
// plus its syllabus topics, instead of the student's whole period.
@Injectable()
export class GenerateSubjectPredictionUseCase {
  constructor(
    @Inject(ANALYTICS_CLIENT) private readonly analyticsClient: IAnalyticsClient,
    @Inject(ACADEMIC_CONTEXT_CLIENT) private readonly academicClient: IAcademicContextClient,
    @Inject(AI_PROVIDER) private readonly aiProvider: IAiRecommendationProvider,
    @Inject(PREDICTION_LOG_REPO) private readonly logRepo: IPredictionLogRepository,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<PredictionResult> {
    const enrollments = await this.academicClient.getEnrollmentsByStudent(studentId);
    const enrollment = enrollments.find((e) => e.subjectId === subjectId && e.status === 'ACTIVE');
    if (!enrollment) {
      throw new NotFoundException('No estás matriculado activo en esta materia');
    }

    const metric = await this.analyticsClient.getLatestSubjectMetric(studentId, subjectId);
    const [gradesContext, topics] = await Promise.all([
      this.academicClient.getSubjectGradesContext(studentId, subjectId, enrollment.periodId),
      this.academicClient.getSubjectTopics(subjectId).catch(() => []),
    ]);

    // Same criterion as RecalculateSubjectPredictionUseCase: fewer than the
    // required weekly signals means there isn't enough data for a real
    // prediction — never guess, and never spend an OpenAI call on nothing.
    if (
      metric === null ||
      metric.riskLevel === null ||
      metric.trendSlope === null ||
      metric.complianceIndex === null ||
      metric.attendanceRate === null
    ) {
      const subjectName = gradesContext.subjectName || 'esta materia';
      const result = new PredictionResult(
        studentId,
        enrollment.periodId,
        {
          riskLevel: metric?.riskLevel ?? 'LOW',
          globalAverage: metric?.averageGrade ?? gradesContext.currentGrade ?? 0,
          complianceIndex: metric?.complianceIndex ?? 0,
          attendance: metric?.attendanceRate ?? 0,
          failedEvaluations: gradesContext.failedEvaluations,
          trendSlope: metric?.trendSlope ?? 0,
        },
        `Todavía no hay suficiente información semanal de ${subjectName} para generar una recomendación personalizada.`,
        [
          {
            type: 'STUDY_HABIT',
            title: 'Completa tu registro semanal',
            reason:
              'Se necesita al menos un check-in semanal con asistencia, cumplimiento y comprensión ' +
              'para poder analizar tu avance en esta materia.',
            priority: 'MEDIUM',
          },
        ],
        MODEL_VERSION,
        new Date(),
        subjectId,
      );
      void this.logRepo.save(result).catch(() => undefined);
      return result;
    }

    const risk: RiskSnapshot = {
      riskLevel: metric.riskLevel,
      globalAverage: metric.averageGrade ?? 0,
      complianceIndex: metric.complianceIndex,
      attendance: metric.attendanceRate,
      failedEvaluations: gradesContext.failedEvaluations,
      trendSlope: metric.trendSlope,
    };

    let ai;
    try {
      ai = await this.aiProvider.generate({
        studentId,
        risk: {
          riskLevel: risk.riskLevel,
          globalAverage: risk.globalAverage,
          complianceIndex: risk.complianceIndex,
          attendance: risk.attendance,
          failedEvaluations: risk.failedEvaluations,
          trendSlope: risk.trendSlope,
        },
        subjects: [
          {
            name: gradesContext.subjectName,
            currentGrade: gradesContext.currentGrade,
            credits: gradesContext.credits,
          },
        ],
        topics,
      });
    } catch {
      // Fallback determinístico local en caso de fallo inesperado de OpenAI
      // (mismo criterio que GeneratePredictionUseCase).
      const isHighRisk = risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL';
      const recommendations: RecommendationItem[] = [
        {
          type: 'STUDY_HABIT',
          title: isHighRisk
            ? 'Reforzar hábitos de estudio urgentemente'
            : 'Mantener hábitos de estudio actuales',
          reason: `Promedio actual en ${gradesContext.subjectName}: ${risk.globalAverage}/20.`,
          priority: isHighRisk ? 'HIGH' : 'LOW',
        },
      ];
      ai = {
        summary: `El estudiante presenta un nivel de riesgo ${risk.riskLevel} en ${gradesContext.subjectName} con un promedio de ${risk.globalAverage}/20.`,
        recommendations,
      };
    }

    const result = new PredictionResult(
      studentId,
      enrollment.periodId,
      risk,
      ai.summary,
      ai.recommendations,
      MODEL_VERSION,
      new Date(),
      subjectId,
    );

    // Persist for traceability/auditing — a failure here must not break the response.
    void this.logRepo.save(result).catch(() => undefined);

    return result;
  }
}
