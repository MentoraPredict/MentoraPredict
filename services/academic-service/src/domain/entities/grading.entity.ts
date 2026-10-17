/**
 * Componente de la nota del periodo (por ejemplo formativa y sumativa).
 * El peso de cada componente lo define la institución y debe sumar 100.
 */
export interface GradingComponent {
  code: string;
  name: string;
  weight: number;
  sortOrder: number;
}

/** Actividad evaluable de una asignatura en un periodo de calificación. */
export interface GradeActivity {
  id: string;
  subjectId: string;
  periodId: string;
  componentCode: string;
  name: string;
  dueDate: Date | null;
  isActive: boolean;
}

/** Nota de un estudiante en una actividad. */
export interface ActivityGrade {
  id: string;
  studentId: string;
  activityId: string;
  value: number;
}

export const SUBJECT_RESULT_STATUSES = [
  'APPROVED',
  'SUPPLEMENTARY_PENDING',
  'FAILED',
  'INCOMPLETE',
] as const;
export type SubjectResultStatus = (typeof SUBJECT_RESULT_STATUSES)[number];

/** Resultado que el sistema sugiere antes de que la autoridad lo confirme. */
export type PromotionSuggestion =
  | 'PROMOTED'
  | 'REPEATS'
  | 'REVIEW'
  | 'PENDING_SUPPLEMENTARY'
  | 'PENDING';

/** Resultados que la autoridad puede confirmar. */
export const PROMOTION_OUTCOMES = ['PROMOTED', 'REPEATS'] as const;
export type PromotionOutcome = (typeof PROMOTION_OUTCOMES)[number];

/** Foto de la nota de un estudiante en una asignatura al cerrar un periodo. */
export interface PeriodResult {
  periodId: string;
  subjectId: string;
  studentId: string;
  value: number | null;
  isComplete: boolean;
  bandCode: string | null;
  closedAt: Date;
}

export interface SupplementaryGrade {
  subjectId: string;
  studentId: string;
  value: number;
  registeredBy: string;
  registeredAt: Date;
}

export interface PeriodClosureEvent {
  id: string;
  periodId: string;
  action: 'CLOSE' | 'REOPEN';
  reason: string | null;
  performedBy: string;
  performedAt: Date;
}

export interface PromotionDecision {
  studentEnrollmentId: string;
  outcome: PromotionOutcome;
  /** true cuando la autoridad decidió distinto de lo que sugería el sistema. */
  isOverride: boolean;
  suggested: PromotionSuggestion;
  notes: string | null;
  decidedBy: string;
  decidedAt: Date;
}
