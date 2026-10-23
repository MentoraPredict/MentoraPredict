import { Shift } from './institution-config.entity';

/** Grado oficial dentro de un nivel (p. ej. "8.º EGB" dentro de EGB Superior). */
export interface GradeLevel {
  code: string;
  levelCode: string;
  name: string;
  ordinal: number;
  sortOrder: number;
}

/** Paralelo: grupo de estudiantes de un grado durante un año lectivo. */
export interface Section {
  id: string;
  schoolYearId: string;
  gradeLevelCode: string;
  name: string;
  shift: Shift;
  capacity: number;
  tutorId: string | null;
  isActive: boolean;
}

/** Asignatura que forma parte de la malla de un grado, con su carga horaria. */
export interface CurriculumSubject {
  gradeLevelCode: string;
  subjectCatalogId: string;
  weeklyHours: number;
}

export interface SectionSummary extends Section {
  courseCount: number;
}
