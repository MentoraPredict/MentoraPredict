import { SubjectEntity } from '../../../domain/entities/subject.entity';

export interface ISubjectRepository {
  findById(id: string): Promise<SubjectEntity | null>;
  findByPeriodId(periodId: string): Promise<SubjectEntity[]>;
  save(subject: SubjectEntity): Promise<SubjectEntity>;
  update(subject: SubjectEntity): Promise<SubjectEntity>;
}
