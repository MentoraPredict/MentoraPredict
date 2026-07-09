import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PredictionResult } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { GenerateSubjectPredictionUseCase } from './generate-subject-prediction.use-case';

// Independent from the global (per-period) cooldown in
// RequestStudentPredictionUseCase — a student can regenerate the global
// recommendation once/hour AND, separately, each subject's recommendation
// once/hour, since findHistory is scoped by subjectId.
const COOLDOWN_MS = 60 * 60 * 1000;

@Injectable()
export class RequestSubjectPredictionUseCase {
  constructor(
    @Inject('IPredictionLogRepository') private readonly logRepo: IPredictionLogRepository,
    private readonly generateSubjectPredictionUC: GenerateSubjectPredictionUseCase,
  ) {}

  async execute(studentId: string, subjectId: string): Promise<PredictionResult> {
    const [lastEntry] = await this.logRepo.findHistory(studentId, 1, subjectId);

    if (lastEntry) {
      const elapsedMs = Date.now() - lastEntry.generatedAt.getTime();
      if (elapsedMs < COOLDOWN_MS) {
        const retryAfterMinutes = Math.max(1, Math.ceil((COOLDOWN_MS - elapsedMs) / 60000));
        throw new HttpException(
          `Ya generaste una recomendación para esta materia recientemente. Intenta de nuevo en ${retryAfterMinutes} minuto(s).`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return this.generateSubjectPredictionUC.execute(studentId, subjectId);
  }
}
