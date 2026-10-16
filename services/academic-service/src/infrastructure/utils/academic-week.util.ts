export interface AcademicWeek {
  academicWeek: number;
  academicYear: number;
}

// ISO 8601 week: weeks start on Monday, week 1 is the week containing the year's first Thursday.
// Normaliza siempre en UTC (no en la hora local del proceso) — los
// contenedores reales corren en UTC, pero esto evita que el resultado
// dependa de en qué timezone se ejecute el código (ej. tests en una
// máquina local con otra zona horaria).
export function getAcademicWeek(date: Date): AcademicWeek {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // move to Thursday of this ISO week

  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);

  const academicWeek =
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));

  return { academicWeek, academicYear: d.getUTCFullYear() };
}

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
export type DayOfWeekName = (typeof DAY_NAMES)[number];

// Todas las fechas concretas dentro de un rango (inclusive) que caen en un
// día de semana dado — usado para generar las class_sessions de una franja
// horaria (class_schedule) a partir de start_date/end_date del período de
// la oferta (Fase B, docs/database/database-update-plan.md §5.2).
export function getSessionDatesInRange(startDate: Date, endDate: Date, dayOfWeek: DayOfWeekName): Date[] {
  const targetDow = DAY_NAMES.indexOf(dayOfWeek);
  const dates: Date[] = [];
  let cursor = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

  while (cursor <= end && new Date(cursor).getUTCDay() !== targetDow) {
    cursor += 24 * 3600 * 1000;
  }

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor += 7 * 24 * 3600 * 1000;
  }

  return dates;
}
