export interface DatasetVersionRecord {
  studentId: string;
  type: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  timestamp: Date;
}

export interface IDatasetVersionRepository {
  save(record: DatasetVersionRecord): Promise<void>;
}
