import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiUsageEntry,
  AiUsageRow,
  AiUsageSummary,
  IAiUsageRepository,
} from '../../domain/ports/i-ai-usage.repository';
import { AiUsageOrmEntity } from './ai-usage.orm-entity';

@Injectable()
export class AiUsageRepository implements IAiUsageRepository {
  private readonly logger = new Logger(AiUsageRepository.name);

  constructor(
    @InjectRepository(AiUsageOrmEntity)
    private readonly repo: Repository<AiUsageOrmEntity>,
  ) {}

  async add(entry: AiUsageEntry): Promise<void> {
    try {
      await this.repo.insert({ id: randomUUID(), ...entry });
    } catch (err) {
      // El registro de uso nunca debe romper una recomendación.
      this.logger.warn(`No se pudo registrar el uso de IA: ${(err as Error).message}`);
    }
  }

  async summarize(days: number, recentLimit: number): Promise<AiUsageSummary> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totals] = await this.repo.query(
      `SELECT COUNT(*)::int AS calls,
              COUNT(*) FILTER (WHERE NOT success)::int AS failures,
              COALESCE(SUM(prompt_tokens), 0)::int AS "promptTokens",
              COALESCE(SUM(completion_tokens), 0)::int AS "completionTokens",
              COALESCE(SUM(total_tokens), 0)::int AS "totalTokens"
         FROM ai_usage_logs
        WHERE created_at >= $1 AND kind = 'recommendation'`,
      [since],
    );

    const byDay = await this.repo.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
              COUNT(*)::int AS calls,
              COALESCE(SUM(total_tokens), 0)::int AS "totalTokens"
         FROM ai_usage_logs
        WHERE created_at >= $1 AND kind = 'recommendation'
        GROUP BY 1 ORDER BY 1`,
      [since],
    );

    const byModel = await this.repo.query(
      `SELECT model, COUNT(*)::int AS calls, COALESCE(SUM(total_tokens), 0)::int AS "totalTokens"
         FROM ai_usage_logs
        WHERE created_at >= $1 AND kind = 'recommendation'
        GROUP BY model ORDER BY 3 DESC`,
      [since],
    );

    const recent = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: recentLimit,
    });

    return {
      days,
      totals,
      byDay,
      byModel,
      recent: recent.map((row) => ({
        createdAt: row.createdAt,
        model: row.model,
        kind: row.kind as AiUsageRow['kind'],
        success: row.success,
        promptTokens: row.promptTokens,
        completionTokens: row.completionTokens,
        totalTokens: row.totalTokens,
        durationMs: row.durationMs,
        error: row.error,
      })),
    };
  }
}