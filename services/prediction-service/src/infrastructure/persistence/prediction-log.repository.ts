import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PredictionResult, RiskSnapshot, RecommendationItem } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { PredictionLogDoc } from './prediction-log.schema';

@Injectable()
export class PredictionLogRepository implements IPredictionLogRepository {
  private readonly logger = new Logger(PredictionLogRepository.name);

  constructor(
    @InjectModel(PredictionLogDoc.name) private readonly model: Model<PredictionLogDoc>,
  ) {}

  async save(result: PredictionResult): Promise<void> {
    try {
      await this.model.create({
        studentId: result.studentId,
        periodId: result.periodId,
        risk: result.risk as unknown as Record<string, unknown>,
        summary: result.summary,
        recommendations: result.recommendations as unknown as Record<string, unknown>[],
        modelVersion: result.modelVersion,
        subjectId: result.subjectId,
      });
    } catch (error) {
      // Best-effort log: MongoDB being unavailable must not fail prediction
      // generation itself, only the historical record of it.
      this.logger.warn(`Failed to persist prediction log: ${(error as Error).message}`);
    }
  }

  async findHistory(studentId: string, limit = 10, subjectId: string | null = null): Promise<PredictionResult[]> {
    try {
      const docs = await this.model
        .find({ studentId, subjectId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return docs.map((d) => new PredictionResult(
        d.studentId,
        d.periodId,
        d.risk as unknown as RiskSnapshot,
        d.summary,
        d.recommendations as unknown as RecommendationItem[],
        d.modelVersion,
        (d as unknown as { createdAt: Date }).createdAt ?? new Date(),
        d.subjectId ?? null,
      ));
    } catch (error) {
      // Best-effort read: an empty history is a safe degradation when
      // MongoDB is unavailable — it just means recommendation history isn't
      // shown and the once/hour cooldown check (which reads this) fails
      // open instead of blocking generation with a 500.
      this.logger.warn(`Failed to read prediction history: ${(error as Error).message}`);
      return [];
    }
  }
}
