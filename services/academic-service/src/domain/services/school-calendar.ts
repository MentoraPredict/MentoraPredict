import { PeriodScheme } from '../entities/school-year.entity';

/**
 * Reglas de calendario del año lectivo (MINEDUC). Todas las fechas son
 * cadenas ISO `YYYY-MM-DD` para evitar desfases por zona horaria.
 *
 * Lo normativo que cambia (cantidad de periodos, mínimo de días) es
 * configurable por institución: aquí solo hay valores por defecto.
 */
export const DEFAULT_MIN_CLASS_DAYS = 200;
export const MIN_PERIODS = 1;
export const MAX_PERIODS = 4;

export const DEFAULT_PERIODS_BY_SCHEME: Record<PeriodScheme, number> = {
  TRIMESTER: 3,
  QUIMESTER: 2,
  SEMESTER: 2,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PeriodRange {
  number: number;
  startDate: string;
  endDate: string;
}

export interface SchoolYearDates {
  startDate: string;
  endDate: string;
  recoveryStartDate?: string | null;
  recoveryEndDate?: string | null;
  supplementaryStartDate?: string | null;
  supplementaryEndDate?: string | null;
}

function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

/** Normaliza un valor de fecha (string o Date) a `YYYY-MM-DD`. */
export function toIsoDate(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromUtc(toUtc(date) + days * DAY_MS);
}

export function diffDays(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** Días lunes a viernes entre dos fechas, ambas incluidas (sin feriados). */
export function countWeekdays(start: string, end: string): number {
  let count = 0;
  for (let t = toUtc(start); t <= toUtc(end); t += DAY_MS) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

/** Divide el año lectivo en `count` periodos consecutivos y sin traslape. */
export function generatePeriodRanges(
  startDate: string,
  endDate: string,
  count: number,
): PeriodRange[] {
  const totalDays = diffDays(startDate, endDate) + 1;
  const base = Math.floor(totalDays / count);
  const remainder = totalDays % count;

  const ranges: PeriodRange[] = [];
  let cursor = startDate;
  for (let i = 0; i < count; i++) {
    const length = base + (i < remainder ? 1 : 0);
    const end = addDays(cursor, length - 1);
    ranges.push({ number: i + 1, startDate: cursor, endDate: end });
    cursor = addDays(end, 1);
  }
  return ranges;
}

/**
 * Valida las fechas del año lectivo. Devuelve los errores bloqueantes.
 */
export function validateSchoolYearDates(dates: SchoolYearDates): string[] {
  const errors: string[] = [];
  const { startDate, endDate } = dates;

  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    return ['Las fechas del año lectivo no son válidas (YYYY-MM-DD)'];
  }
  if (startDate >= endDate) {
    errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  const optionalPair = (
    label: string,
    from?: string | null,
    to?: string | null,
  ): [string, string] | null => {
    if (!from && !to) return null;
    if (!from || !to) {
      errors.push(`${label}: debe indicar fecha de inicio y de fin`);
      return null;
    }
    if (!isIsoDate(from) || !isIsoDate(to)) {
      errors.push(`${label}: fechas no válidas`);
      return null;
    }
    if (from > to) {
      errors.push(`${label}: el inicio debe ser anterior o igual al fin`);
      return null;
    }
    return [from, to];
  };

  const recovery = optionalPair(
    'Recuperación',
    dates.recoveryStartDate,
    dates.recoveryEndDate,
  );
  const supplementary = optionalPair(
    'Supletorios',
    dates.supplementaryStartDate,
    dates.supplementaryEndDate,
  );

  if (recovery && recovery[0] <= endDate) {
    errors.push('La recuperación debe iniciar después del fin de clases');
  }
  if (supplementary && supplementary[0] <= endDate) {
    errors.push('Los supletorios deben iniciar después del fin de clases');
  }
  if (recovery && supplementary && supplementary[0] <= recovery[1]) {
    errors.push('Los supletorios deben iniciar después de la recuperación');
  }
  return errors;
}

/**
 * Valida que los periodos estén dentro del año, ordenados y sin traslape.
 */
export function validatePeriodRanges(
  yearStart: string,
  yearEnd: string,
  ranges: PeriodRange[],
): string[] {
  const errors: string[] = [];
  const sorted = [...ranges].sort((a, b) => a.number - b.number);

  sorted.forEach((range, index) => {
    if (range.startDate >= range.endDate) {
      errors.push(`Periodo ${range.number}: el inicio debe ser anterior al fin`);
    }
    if (range.startDate < yearStart || range.endDate > yearEnd) {
      errors.push(`Periodo ${range.number}: debe estar dentro del año lectivo`);
    }
    const prev = sorted[index - 1];
    if (prev && range.startDate <= prev.endDate) {
      errors.push(
        `Periodo ${range.number}: se traslapa con el periodo ${prev.number}`,
      );
    }
  });
  return errors;
}

/** Avisos no bloqueantes (p. ej. días de clase estimados bajo el mínimo). */
export function buildCalendarWarnings(
  startDate: string,
  endDate: string,
  minClassDays: number,
): string[] {
  const estimated = countWeekdays(startDate, endDate);
  if (estimated < minClassDays) {
    return [
      `El calendario tiene ${estimated} días laborables, por debajo del mínimo de ${minClassDays} días de clase`,
    ];
  }
  return [];
}

/** Periodo vigente según la fecha dada (no depende de un indicador manual). */
export function findCurrentRange<T extends { startDate: string; endDate: string }>(
  ranges: T[],
  today: string,
): T | null {
  return ranges.find((r) => r.startDate <= today && today <= r.endDate) ?? null;
}
