export type SchoolYearStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';
export type SchoolRegime = 'SIERRA_AMAZONIA' | 'COSTA_GALAPAGOS';
export type PeriodScheme = 'TRIMESTER' | 'QUIMESTER' | 'SEMESTER';

export class SchoolYearEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public regime: SchoolRegime,
    public periodScheme: PeriodScheme,
    public periodsCount: number,
    public startDate: string,
    public endDate: string,
    public minClassDays: number,
    public recoveryStartDate: string | null,
    public recoveryEndDate: string | null,
    public supplementaryStartDate: string | null,
    public supplementaryEndDate: string | null,
    public status: SchoolYearStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
