import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IDatasetVersionRepository, DatasetVersionRecord } from '../../domain/ports/i-dataset-version.repository';
import { DatasetVersionOrmEntity } from './dataset-version.orm-entity';

@Injectable()
export class DatasetVersionRepository implements IDatasetVersionRepository {
  private readonly logger = new Logger(DatasetVersionRepository.name);

  constructor(
    @InjectRepository(DatasetVersionOrmEntity)
    private readonly repo: Repository<DatasetVersionOrmEntity>,
  ) {}

  async save(record: DatasetVersionRecord): Promise<void> {
    try {
      await this.repo.insert({
        id: randomUUID(),
        ...record,
      } as QueryDeepPartialEntity<DatasetVersionOrmEntity>);
    } catch (error) {
      // Best-effort audit trail: a failed write must not fail the calculation
      // that produced this record (e.g. CalculateTrendUseCase).
      this.logger.warn(
        `Failed to persist dataset version audit record (type=${record.type}): ${(error as Error).message}`,
      );
    }
  }
}
