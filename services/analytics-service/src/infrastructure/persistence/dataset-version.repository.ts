import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDatasetVersionRepository, DatasetVersionRecord } from '../../domain/ports/i-dataset-version.repository';
import { DatasetVersion } from './dataset-version.schema';

@Injectable()
export class DatasetVersionRepository implements IDatasetVersionRepository {
  constructor(
    @InjectModel(DatasetVersion.name) private readonly model: Model<DatasetVersion>,
  ) {}

  async save(record: DatasetVersionRecord): Promise<void> {
    await this.model.create(record);
  }
}
