import { SchoolYearEntity } from '../../../domain/entities/school-year.entity';
import { AcademicPeriodEntity } from '../../../domain/entities/academic-period.entity';

export const SCHOOL_YEAR_REPOSITORY_TOKEN = 'ISchoolYearRepository';

export interface ISchoolYearRepository {
  findById(id: string): Promise<SchoolYearEntity | null>;
  findAll(): Promise<SchoolYearEntity[]>;
  findActive(): Promise<SchoolYearEntity | null>;
  findByCode(code: string): Promise<SchoolYearEntity | null>;
  findByName(name: string): Promise<SchoolYearEntity | null>;
  /** Persiste el año y sus periodos en una sola transacción. */
  saveWithPeriods(
    year: SchoolYearEntity,
    periods: AcademicPeriodEntity[],
  ): Promise<void>;
  update(year: SchoolYearEntity): Promise<SchoolYearEntity>;
  /** Cuántos subjects cuelgan de los periodos del año. */
  hasRecords(schoolYearId: string): Promise<boolean>;
  /** Elimina el año y sus periodos en una sola transacción. */
  deleteWithPeriods(id: string): Promise<void>;
}
