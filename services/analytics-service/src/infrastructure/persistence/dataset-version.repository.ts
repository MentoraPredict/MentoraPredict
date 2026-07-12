import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDatasetVersionRepository, DatasetVersionRecord } from '../../domain/ports/i-dataset-version.repository';
import { DatasetVersion } from './dataset-version.schema';

@Injectable()
export class DatasetVersionRepository implements IDatasetVersionRepository {
  private readonly logger = new Logger(DatasetVersionRepository.name);

  constructor(
    @InjectModel(DatasetVersion.name) private readonly model: Model<DatasetVersion>,
  ) {}

  async save(record: DatasetVersionRecord): Promise<void> {
    try {
      await this.model.create(record);
    } catch (error) {
      // Best-effort audit trail: MongoDB being unavailable must not fail the
      // calculation that produced this record (e.g. CalculateTrendUseCase).
      this.logger.warn(
        `Failed to persist dataset version audit record (type=${record.type}): ${(error as Error).message}`,
      );
    }
  }
}
