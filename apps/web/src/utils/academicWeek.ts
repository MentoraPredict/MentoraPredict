export interface AcademicWeek {
  academicWeek: number;
  academicYear: number;
}

// Puerto directo de services/academic-service/src/infrastructure/utils/academic-week.util.ts
// — misma semana ISO 8601 que ya usa el backend para academicWeek/academicYear,
// necesaria acá para anclar el eje de semanas del gráfico de progreso a la
// fecha real de inicio del período (no a un contador arbitrario).
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

/** Offset en semanas (1-based) de `week` respecto a `periodStart` — asume
 * ~52 semanas por año, suficiente para ubicar una semana dentro de un
 * período académico de ~16 semanas aunque cruce el límite de año. */
export function weekOffsetFrom(periodStart: AcademicWeek, week: AcademicWeek): number {
  return (
    (week.academicYear - periodStart.academicYear) * 52 +
    (week.academicWeek - periodStart.academicWeek) +
    1
  );
}
