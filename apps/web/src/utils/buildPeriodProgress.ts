import { getAcademicWeek, weekOffsetFrom } from "@/utils/academicWeek";
import type { CourseProgressPoint } from "@/types/course";

const DEFAULT_TOTAL_WEEKS = 16;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Reubica el progreso semanal real (que llega anclado a la semana ISO de
 * calendario) contra semanas relativas al inicio del período académico
 * (Semana 1..N), rellenando con huecos las semanas sin datos todavía — así
 * el eje del gráfico siempre evidencia el período completo, no solo las
 * semanas con datos. `totalWeeks` sale de startDate/endDate reales del
 * período activo (o 16 si no hay fechas disponibles). Compartido entre
 * estudiante (progreso por materia) y docente (progreso del curso).
 */
export function buildPeriodProgress(
  progress: CourseProgressPoint[],
  periodStartDate: string | null,
  periodEndDate: string | null
): CourseProgressPoint[] {
  if (!periodStartDate) return progress;

  const start = new Date(periodStartDate);
  const end = periodEndDate ? new Date(periodEndDate) : null;
  const totalWeeks =
    end && end.getTime() > start.getTime()
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_WEEK))
      : DEFAULT_TOTAL_WEEKS;

  const periodStartWeek = getAcademicWeek(start);

  const realPoints = progress.filter(
    (point) => point.academicWeek !== undefined && point.academicYear !== undefined
  );
  const projectionPoints = progress.filter((point) => point.academicWeek === undefined);

  const byWeekOffset = new Map<number, CourseProgressPoint>();
  for (const point of realPoints) {
    const offset = weekOffsetFrom(periodStartWeek, {
      academicWeek: point.academicWeek!,
      academicYear: point.academicYear!,
    });
    if (offset >= 1) {
      byWeekOffset.set(offset, point);
    }
  }

  const maxOffset = Math.max(0, ...byWeekOffset.keys());
  const effectiveTotalWeeks = Math.max(totalWeeks, maxOffset);

  const weeks: CourseProgressPoint[] = [];
  for (let weekNumber = 1; weekNumber <= effectiveTotalWeeks; weekNumber += 1) {
    const existing = byWeekOffset.get(weekNumber);
    weeks.push(existing ? { ...existing, week: `Semana ${weekNumber}` } : { week: `Semana ${weekNumber}` });
  }

  // La proyección sigue a la última semana con datos, sobre las semanas aún
  // vacías del periodo. Si se dejara al final del eje, la línea punteada
  // quedaría separada de la real por todas las semanas sin datos y solo se
  // vería un punto suelto en la última semana real.
  if (maxOffset === 0) return [...weeks, ...projectionPoints];

  projectionPoints.forEach((point, step) => {
    const index = maxOffset + step;
    if (index < weeks.length) {
      weeks[index] = { ...weeks[index], projection: point.projection };
    } else {
      weeks.push({ week: `Semana ${index + 1}`, projection: point.projection });
    }
  });

  return weeks;
}
