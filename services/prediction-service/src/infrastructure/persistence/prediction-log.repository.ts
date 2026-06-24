import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PredictionResult, RiskSnapshot, RecommendationItem } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { PredictionLogDoc } from './prediction-log.schema';

@Injectable()
export class PredictionLogRepository implements IPredictionLogRepository {
  constructor(
    @InjectModel(PredictionLogDoc.name) private readonly model: Model<PredictionLogDoc>,
  ) {}

  async save(result: PredictionResult): Promise<void> {
    await this.model.create({
      studentId: result.studentId,
      periodId: result.periodId,
      risk: result.risk as unknown as Record<string, unknown>,
      summary: result.summary,
      recommendations: result.recommendations as unknown as Record<string, unknown>[],
      modelVersion: result.modelVersion,
    });
  }

  async findHistory(studentId: string, limit = 10): Promise<PredictionResult[]> {
    const docs = await this.model
      .find({ studentId })
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
    ));
  }
}
