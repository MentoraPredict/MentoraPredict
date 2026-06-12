import { GradeHistoryEntity } from '../../../domain/entities/grade-history.entity';

export interface IGradeHistoryRepository {
  save(entry: GradeHistoryEntity): Promise<GradeHistoryEntity>;
}
