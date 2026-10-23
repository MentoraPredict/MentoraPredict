import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  IAiRecommendationProvider,
  AiRecommendationRequest,
  AiRecommendationResult,
} from '../../application/ports/output/i-ai-recommendation.provider';
import { IAiUsageRepository } from '../../domain/ports/i-ai-usage.repository';
import { AI_USAGE_REPO } from '../../application/use-cases/ai-settings.use-cases';
import { AiRuntimeConfigService } from '../../application/services/ai-runtime-config.service';

const TIMEOUT_MS = 20000;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an academic advisor assistant for MentoraPredict, a student performance
prediction platform at a school (colegio) in Ecuador, for minors. You receive a student's deterministically-computed risk level
plus their current grades, and you must return ONLY a JSON object (no prose, no markdown fences)
with this exact shape:

{
  "summary": "2-3 sentence plain-language summary of the student's academic situation",
  "recommendations": [
    {
      "type": "STUDY_HABIT" | "TUTORING" | "TIME_MANAGEMENT" | "ATTENDANCE" | "SUBJECT_FOCUS" | "WELLBEING",
      "title": "short actionable title",
      "reason": "1 sentence explaining why, grounded in the data given",
      "priority": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}

Rules:
- Never invent grades, attendance, or other numbers not present in the input.
- Produce between 2 and 5 recommendations, ordered by priority (HIGH first).
- Write in Spanish (the platform's primary language is Ecuadorian Spanish).
- You do NOT decide the risk level — it is provided to you already classified. Use it as context only.
- If "topics" is present and non-empty, it is the syllabus (unit titles, in teaching order) for the ONE
  subject in focus. In that case, at least one recommendation (prefer type SUBJECT_FOCUS or TUTORING)
  MUST name a specific topic verbatim from that list in its title or reason — e.g. "Repasar Unidad 3:
  Aplicaciones prácticas" instead of "Repasar los temas de la materia". Never invent a topic name that
  is not in the given list, and never quote a topic if "topics" is absent or empty.`;

interface OpenAiUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

@Injectable()
export class OpenAiRecommendationProvider implements IAiRecommendationProvider {
  private readonly logger = new Logger(OpenAiRecommendationProvider.name);

  constructor(
    private readonly runtime: AiRuntimeConfigService,
    @Inject(AI_USAGE_REPO) private readonly usage: IAiUsageRepository,
  ) {}

  async generate(input: AiRecommendationRequest): Promise<AiRecommendationResult> {
    const { apiKey, model, enabled } = await this.runtime.resolve();

    if (!enabled) {
      this.logger.log('La IA está desactivada desde administración — se usa la recomendación por reglas');
      return this.fallback(input);
    }
    if (!apiKey) {
      this.logger.warn('No hay clave de OpenAI configurada — se usa la recomendación por reglas');
      return this.fallback(input);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const started = Date.now();

    try {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(input) },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text();
        await this.recordUsage(model, false, null, Date.now() - started, `HTTP ${res.status}`);
        throw new InternalServerErrorException(`OpenAI responded ${res.status}: ${body}`);
      }

      const data = (await res.json()) as any;
      await this.recordUsage(model, true, data?.usage, Date.now() - started, null);

      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new InternalServerErrorException('OpenAI returned no content');
      }

      return this.parseAndValidate(content, input);
    } catch (err) {
      clearTimeout(timer);
      this.logger.error('OpenAI call failed, using fallback recommendation', err as Error);
      return this.fallback(input);
    }
  }

  private async recordUsage(
    model: string,
    success: boolean,
    usage: OpenAiUsage | null | undefined,
    durationMs: number,
    error: string | null,
  ): Promise<void> {
    await this.usage.add({
      model,
      kind: 'recommendation',
      success,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      durationMs,
      error,
    });
  }

  private parseAndValidate(raw: string, input: AiRecommendationRequest): AiRecommendationResult {
    try {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.summary !== 'string' ||
        !Array.isArray(parsed.recommendations) ||
        parsed.recommendations.length === 0
      ) {
        throw new Error('shape mismatch');
      }
      return {
        summary: parsed.summary,
        recommendations: parsed.recommendations,
      };
    } catch {
      this.logger.warn('OpenAI returned malformed JSON, using fallback recommendation');
      return this.fallback(input);
    }
  }

  // Deterministic, data-grounded fallback used when the AI is disabled,
  // unreachable, misconfigured, or returns malformed output. Keeps the
  // endpoint usable without an OpenAI key (e.g. local dev).
  private fallback(input: AiRecommendationRequest): AiRecommendationResult {
    const isHighRisk = input.risk.riskLevel === 'HIGH' || input.risk.riskLevel === 'CRITICAL';
    return {
      summary: `El estudiante presenta un nivel de riesgo ${input.risk.riskLevel} con un promedio global de ${input.risk.globalAverage}. Este resumen fue generado por reglas, sin inteligencia artificial.`,
      recommendations: [
        {
          type: 'STUDY_HABIT',
          title: isHighRisk ? 'Reforzar hábitos de estudio urgentemente' : 'Mantener hábitos de estudio actuales',
          reason: `Promedio global actual: ${input.risk.globalAverage}/10.`,
          priority: isHighRisk ? 'HIGH' : 'LOW',
        },
        {
          type: 'TUTORING',
          title: 'Considerar tutoría académica',
          reason: `${input.risk.failedEvaluations} evaluación(es) por debajo de la nota mínima.`,
          priority: input.risk.failedEvaluations > 0 ? 'MEDIUM' : 'LOW',
        },
      ],
    };
  }
}
