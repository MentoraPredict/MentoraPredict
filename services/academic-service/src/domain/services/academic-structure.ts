import { CurriculumSubject } from '../entities/academic-structure.entity';
import { InstitutionLevel } from '../entities/institution-config.entity';

/**
 * Reglas de la estructura académica (grados, paralelos y malla curricular).
 * Funciones puras: devuelven la lista de errores; vacía significa válido.
 */

export const MAX_SECTION_NAME_LENGTH = 10;
// Cota de cordura, no un límite normativo: el aforo real lo fija cada institución.
export const MAX_SECTION_CAPACITY = 100;
export const MAX_WEEKLY_HOURS = 40;

export interface SectionInput {
  name: string;
  capacity: number;
  shift: string;
}

export function validateSection(
  input: SectionInput,
  level: InstitutionLevel | undefined,
): string[] {
  const errors: string[] = [];
  const name = input.name.trim();

  if (!name) {
    errors.push('El nombre del paralelo es obligatorio');
  } else if (name.length > MAX_SECTION_NAME_LENGTH) {
    errors.push(`El nombre del paralelo no puede superar ${MAX_SECTION_NAME_LENGTH} caracteres`);
  }

  if (
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > MAX_SECTION_CAPACITY
  ) {
    errors.push(`El cupo debe ser un entero entre 1 y ${MAX_SECTION_CAPACITY}`);
  }

  if (!level || !level.isActive) {
    errors.push('El nivel de este grado no está activo en la institución');
  } else if (!level.shifts.includes(input.shift as InstitutionLevel['shifts'][number])) {
    errors.push('La jornada no está habilitada para este nivel');
  }
  return errors;
}

export function validateCurriculum(items: CurriculumSubject[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.subjectCatalogId)) {
      errors.push('Hay asignaturas repetidas en la malla');
      break;
    }
    seen.add(item.subjectCatalogId);
  }
  if (
    items.some(
      (i) =>
        !Number.isInteger(i.weeklyHours) ||
        i.weeklyHours < 1 ||
        i.weeklyHours > MAX_WEEKLY_HOURS,
    )
  ) {
    errors.push(`La carga horaria semanal debe estar entre 1 y ${MAX_WEEKLY_HOURS} horas`);
  }
  return errors;
}

export interface CourseGenerationPlan {
  toCreate: CurriculumSubject[];
  alreadyOffered: number;
}

/** Qué asignaturas de la malla faltan por ofertar en un paralelo. */
export function planCourseGeneration(
  curriculum: CurriculumSubject[],
  offeredCatalogIds: Set<string>,
): CourseGenerationPlan {
  const toCreate = curriculum.filter((c) => !offeredCatalogIds.has(c.subjectCatalogId));
  return { toCreate, alreadyOffered: curriculum.length - toCreate.length };
}

export interface PeriodWindow {
  id: string;
  startDate: string;
  endDate: string;
}

/**
 * Periodo al que se ancla una asignatura nueva: el vigente por fecha; si el
 * año aún no empieza, el primero; si ya terminó, el último.
 */
export function pickAnchorPeriod(periods: PeriodWindow[], today: string): PeriodWindow | null {
  if (periods.length === 0) return null;
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    sorted.find((p) => p.startDate <= today && today <= p.endDate) ??
    sorted.find((p) => p.startDate > today) ??
    sorted[sorted.length - 1]
  );
}
