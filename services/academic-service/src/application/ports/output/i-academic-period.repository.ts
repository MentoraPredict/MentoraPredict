import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

export const ACADEMIC_PERIOD_REPOSITORY_TOKEN = 'IAcademicPeriodRepository';

export interface IAcademicPeriodRepository {
  findById(id: string): Promise<AcademicPeriodEntity | null>;
  findActive(): Promise<AcademicPeriodEntity | null>;
  findAll(): Promise<AcademicPeriodEntity[]>;
  findByCode(code: string): Promise<AcademicPeriodEntity | null>;
  findByName(name: string): Promise<AcademicPeriodEntity | null>;
  countActive(): Promise<number>;
  save(period: AcademicPeriodEntity): Promise<AcademicPeriodEntity>;
  update(period: AcademicPeriodEntity): Promise<AcademicPeriodEntity>;
  hasRecords(periodId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
