import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

export interface IAcademicPeriodRepository {
  findById(id: string): Promise<AcademicPeriodEntity | null>;
  findActive(): Promise<AcademicPeriodEntity | null>;
}
