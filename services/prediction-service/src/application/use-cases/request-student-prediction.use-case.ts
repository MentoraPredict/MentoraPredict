import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PredictionResult } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { GeneratePredictionUseCase } from './generate-prediction.use-case';

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour — each call hits OpenAI for real, no cache/dedup upstream.

@Injectable()
export class RequestStudentPredictionUseCase {
  constructor(
    @Inject('IPredictionLogRepository') private readonly logRepo: IPredictionLogRepository,
    private readonly generatePredictionUC: GeneratePredictionUseCase,
  ) {}

  async execute(studentId: string, periodId: string): Promise<PredictionResult> {
    const [lastEntry] = await this.logRepo.findHistory(studentId, 1);

    if (lastEntry) {
      const elapsedMs = Date.now() - lastEntry.generatedAt.getTime();
      if (elapsedMs < COOLDOWN_MS) {
        const retryAfterMinutes = Math.max(1, Math.ceil((COOLDOWN_MS - elapsedMs) / 60000));
        throw new HttpException(
          `Ya generaste una recomendación recientemente. Intenta de nuevo en ${retryAfterMinutes} minuto(s).`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return this.generatePredictionUC.execute(studentId, periodId);
  }
}
