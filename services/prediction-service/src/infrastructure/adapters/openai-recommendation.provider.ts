import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiRecommendationProvider,
  AiRecommendationRequest,
  AiRecommendationResult,
} from '../../application/ports/output/i-ai-recommendation.provider';

const TIMEOUT_MS = 20000;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an academic advisor assistant for MentoraPredict, a student performance
prediction platform at a university. You receive a student's deterministically-computed risk level
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
- You do NOT decide the risk level — it is provided to you already classified. Use it as context only.`;

@Injectable()
export class OpenAiRecommendationProvider implements IAiRecommendationProvider {
  private readonly logger = new Logger(OpenAiRecommendationProvider.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENAI_API_KEY', '');
    this.model = this.config.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async generate(input: AiRecommendationRequest): Promise<AiRecommendationResult> {
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set — returning fallback recommendation');
      return this.fallback(input);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
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
        throw new InternalServerErrorException(`OpenAI responded ${res.status}: ${body}`);
      }

      const data = (await res.json()) as any;
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

  // Deterministic, data-grounded fallback used when OpenAI is unreachable,
  // misconfigured, or returns malformed output. Keeps the endpoint usable
  // even without an OpenAI key (e.g. local dev).
  private fallback(input: AiRecommendationRequest): AiRecommendationResult {
    const isHighRisk = input.risk.riskLevel === 'HIGH' || input.risk.riskLevel === 'CRITICAL';
    return {
      summary: `El estudiante presenta un nivel de riesgo ${input.risk.riskLevel} con un promedio global de ${input.risk.globalAverage}. Este resumen fue generado sin conexión a OpenAI.`,
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
