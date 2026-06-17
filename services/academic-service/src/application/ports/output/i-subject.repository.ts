import { SubjectEntity } from '../../../domain/entities/subject.entity';

export const SUBJECT_REPOSITORY_TOKEN = 'ISubjectRepository';

export interface ISubjectRepository {
  findById(id: string): Promise<SubjectEntity | null>;
  findByAcademicPeriodId(periodId: string): Promise<SubjectEntity[]>;
  findAll(filters?: { careerId?: string; periodId?: string }): Promise<SubjectEntity[]>;
  findByCode(code: string): Promise<SubjectEntity | null>;
  findByNameAndPeriod(name: string, periodId: string): Promise<SubjectEntity | null>;
  hasAcademicRecords(subjectId: string): Promise<boolean>;
  save(subject: SubjectEntity): Promise<SubjectEntity>;
  update(subject: SubjectEntity): Promise<SubjectEntity>;
  delete(id: string): Promise<void>;
}
