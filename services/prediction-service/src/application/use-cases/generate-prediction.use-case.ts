import { Inject, Injectable } from '@nestjs/common';
import { PredictionResult, RecommendationItem } from '../../domain/entities/prediction-result.entity';
import { IAnalyticsClient } from '../ports/output/i-analytics.client';
import { IAcademicContextClient } from '../ports/output/i-academic-context.client';
import { IAiRecommendationProvider } from '../ports/output/i-ai-recommendation.provider';
import { IGeneratePredictionUseCase } from '../ports/input/i-generate-prediction.use-case';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';

export const ANALYTICS_CLIENT = 'IAnalyticsClient';
export const ACADEMIC_CONTEXT_CLIENT = 'IAcademicContextClient';
export const AI_PROVIDER = 'IAiRecommendationProvider';
export const PREDICTION_LOG_REPO = 'IPredictionLogRepository';

const MODEL_VERSION = 'gpt-recommendation-v1';

@Injectable()
export class GeneratePredictionUseCase implements IGeneratePredictionUseCase {
  constructor(
    @Inject(ANALYTICS_CLIENT) private readonly analyticsClient: IAnalyticsClient,
    @Inject(ACADEMIC_CONTEXT_CLIENT) private readonly academicClient: IAcademicContextClient,
    @Inject(AI_PROVIDER) private readonly aiProvider: IAiRecommendationProvider,
    @Inject(PREDICTION_LOG_REPO) private readonly logRepo: IPredictionLogRepository,
  ) {}

  async execute(studentId: string, periodId: string): Promise<PredictionResult> {
    // 1. Risk is computed deterministically by analytics-service (RF-018) —
    //    prediction-service never re-implements that math, it only consumes it.
    const risk = await this.analyticsClient.getRiskSnapshot(studentId, periodId);

    // 2. Academic context (subjects + current grades) feeds the AI prompt
    //    so recommendations are grounded in real data, not hallucinated.
    const context = await this.academicClient.getStudentContext(studentId, periodId);

    // 3. OpenAI only produces the natural-language summary + recommendation
    //    plan. It never decides the risk level itself.
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
        subjects: context.subjects.map((s) => ({
          name: s.name,
          currentGrade: s.currentGrade,
          credits: s.credits,
        })),
      });
    } catch (err) {
      // C-12: Fallback determinístico local en caso de fallo inesperado de OpenAI
      const recommendations: RecommendationItem[] = [
        {
          type: 'STUDY_HABIT',
          title: risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL'
            ? 'Reforzar hábitos de estudio urgentemente'
            : 'Mantener hábitos de estudio actuales',
          reason: `Promedio global actual: ${risk.globalAverage}/10.`,
          priority: risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL' ? 'HIGH' : 'LOW',
        },
      ];
      ai = {
        summary: `El estudiante presenta un nivel de riesgo ${risk.riskLevel} con un promedio global de ${risk.globalAverage}.`,
        recommendations,
      };
    }

    const result = new PredictionResult(
      studentId,
      periodId,
      risk,
      ai.summary,
      ai.recommendations,
      MODEL_VERSION,
      new Date(),
    );

    // 4. Persist for traceability/auditing (RF-022-equivalent for predictions).
    //    Failures here must not break the response to the caller.
    void this.logRepo.save(result).catch(() => undefined);

    return result;
  }
}
