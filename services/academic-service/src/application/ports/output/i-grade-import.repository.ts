import { GradeImportEntity } from '../../../domain/entities/grade-import.entity';

export interface IGradeImportRepository {
  save(entity: GradeImportEntity): Promise<GradeImportEntity>;
  findById(id: string): Promise<GradeImportEntity | null>;
  findBySubjectIdPaginated(
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: GradeImportEntity[]; total: number }>;
}
