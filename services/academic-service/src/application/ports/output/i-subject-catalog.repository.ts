import { SubjectCatalogEntity } from '../../../domain/entities/subject-catalog.entity';

export const SUBJECT_CATALOG_REPOSITORY_TOKEN = 'ISubjectCatalogRepository';

export interface ISubjectCatalogRepository {
  findById(id: string): Promise<SubjectCatalogEntity | null>;
  findByCode(code: string): Promise<SubjectCatalogEntity | null>;
  findAll(): Promise<SubjectCatalogEntity[]>;
  save(catalog: SubjectCatalogEntity): Promise<SubjectCatalogEntity>;
  update(catalog: SubjectCatalogEntity): Promise<SubjectCatalogEntity>;
}
