import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { SchoolYearEntity } from '../../domain/entities/school-year.entity';
import {
  buildCalendarWarnings,
  findCurrentRange,
  toIsoDate,
} from '../../domain/services/school-calendar';

export interface GradingPeriodView {
  id: string;
  name: string;
  code: string;
  number: number | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  gradesDueDate: string | null;
  isCurrent: boolean;
  /** Cerrado: sus notas están congeladas hasta que se reabra. */
  isClosed: boolean;
}

export interface SchoolYearView {
  id: string;
  name: string;
  code: string;
  regime: string;
  periodScheme: string;
  periodsCount: number;
  startDate: string;
  endDate: string;
  minClassDays: number;
  recoveryStartDate: string | null;
  recoveryEndDate: string | null;
  supplementaryStartDate: string | null;
  supplementaryEndDate: string | null;
  status: string;
  periods: GradingPeriodView[];
  currentPeriodId: string | null;
  warnings: string[];
}

/** Fecha de hoy en la zona horaria de Ecuador, en formato YYYY-MM-DD. */
export function todayInEcuador(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });
}

export function buildSchoolYearView(
  year: SchoolYearEntity,
  periods: AcademicPeriodEntity[],
  today: string = todayInEcuador(),
): SchoolYearView {
  const ranges = periods.map((p) => ({
    id: p.id,
    startDate: toIsoDate(p.startDate),
    endDate: toIsoDate(p.endDate),
  }));
  const current = findCurrentRange(ranges, today);

  const sorted = [...periods].sort(
    (a, b) => (a.number ?? 0) - (b.number ?? 0),
  );

  return {
    id: year.id,
    name: year.name,
    code: year.code,
    regime: year.regime,
    periodScheme: year.periodScheme,
    periodsCount: year.periodsCount,
    startDate: year.startDate,
    endDate: year.endDate,
    minClassDays: year.minClassDays,
    recoveryStartDate: year.recoveryStartDate,
    recoveryEndDate: year.recoveryEndDate,
    supplementaryStartDate: year.supplementaryStartDate,
    supplementaryEndDate: year.supplementaryEndDate,
    status: year.status,
    periods: sorted.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      number: p.number,
      type: p.type,
      status: p.status,
      startDate: toIsoDate(p.startDate),
      endDate: toIsoDate(p.endDate),
      gradesDueDate: p.gradesDueDate ? toIsoDate(p.gradesDueDate) : null,
      isCurrent: current?.id === p.id,
      isClosed: p.isClosed,
    })),
    currentPeriodId: current?.id ?? null,
    warnings: buildCalendarWarnings(
      year.startDate,
      year.endDate,
      year.minClassDays,
    ),
  };
}
