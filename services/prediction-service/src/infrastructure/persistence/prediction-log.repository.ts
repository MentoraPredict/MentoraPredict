import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PredictionResult, RiskSnapshot, RecommendationItem } from '../../domain/entities/prediction-result.entity';
import { IPredictionLogRepository } from '../../domain/ports/i-prediction-log.repository';
import { PredictionLogOrmEntity } from './prediction-log.orm-entity';

@Injectable()
export class PredictionLogRepository implements IPredictionLogRepository {
  private readonly logger = new Logger(PredictionLogRepository.name);

  constructor(
    @InjectRepository(PredictionLogOrmEntity)
    private readonly repo: Repository<PredictionLogOrmEntity>,
  ) {}

  async save(result: PredictionResult): Promise<void> {
    try {
      await this.repo.insert({
        id: randomUUID(),
        studentId: result.studentId,
        periodId: result.periodId,
        subjectId: result.subjectId,
        risk: result.risk,
        summary: result.summary,
        recommendations: result.recommendations,
        modelVersion: result.modelVersion,
      } as unknown as QueryDeepPartialEntity<PredictionLogOrmEntity>);
    } catch (error) {
      // Best-effort log: a failed write must not fail prediction generation
      // itself, only the historical record of it.
      this.logger.warn(`Failed to persist prediction log: ${(error as Error).message}`);
    }
  }

  async findHistory(studentId: string, limit = 10, subjectId: string | null = null): Promise<PredictionResult[]> {
    try {
      const rows = await this.repo.find({
        where: { studentId, subjectId: subjectId ?? IsNull() },
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return rows.map((r) => new PredictionResult(
        r.studentId,
        r.periodId,
        r.risk as unknown as RiskSnapshot,
        r.summary,
        r.recommendations as unknown as RecommendationItem[],
        r.modelVersion,
        r.createdAt,
        r.subjectId ?? null,
      ));
    } catch (error) {
      // Best-effort read: an empty history is a safe degradation — it just
      // means recommendation history isn't shown and the once/hour cooldown
      // check (which reads this) fails open instead of blocking generation
      // with a 500.
      this.logger.warn(`Failed to read prediction history: ${(error as Error).message}`);
      return [];
    }
  }
}
