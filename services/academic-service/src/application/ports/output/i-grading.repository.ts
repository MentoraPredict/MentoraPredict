import {
  GradeActivity,
  GradingComponent,
  PeriodClosureEvent,
  PeriodResult,
  PromotionDecision,
  SupplementaryGrade,
} from '../../../domain/entities/grading.entity';

export const GRADING_REPOSITORY_TOKEN = 'IGradingRepository';

/** Una nota registrada en una actividad, con lo necesario para calcular el periodo. */
export interface GradeRow {
  gradeId: string;
  studentId: string;
  subjectId: string;
  activityId: string;
  periodId: string;
  componentCode: string;
  value: number;
}

export interface GradeUpsertEntry {
  studentId: string;
  activityId: string;
  subjectId: string;
  value: number;
}

export interface GradeUpsertResult {
  created: number;
  updated: number;
  unchanged: number;
}

/** Asignatura de un paralelo, tal como se necesita para calificar y cerrar. */
export interface CourseSummary {
  id: string;
  name: string;
  code: string;
  sectionId: string;
  teacherId: string | null;
  academicPeriodId: string;
}

export interface IGradingRepository {
  getComponents(): Promise<GradingComponent[]>;
  replaceComponents(components: GradingComponent[]): Promise<GradingComponent[]>;
  /** Códigos de componente que ya tienen actividades registradas. */
  listUsedComponentCodes(): Promise<string[]>;

  findActivity(id: string): Promise<GradeActivity | null>;
  listActivities(subjectId: string, periodId?: string): Promise<GradeActivity[]>;
  saveActivity(activity: GradeActivity): Promise<GradeActivity>;
  countActivityGrades(activityId: string): Promise<number>;

  /** Notas de actividades activas; filtra por asignatura, estudiante y/o periodo. */
  listGradeRows(filter: {
    subjectId?: string;
    studentId?: string;
    periodId?: string;
  }): Promise<GradeRow[]>;
  /** Crea o actualiza las notas y deja historial de cada cambio, en una transacción. */
  upsertGrades(entries: GradeUpsertEntry[], registeredBy: string): Promise<GradeUpsertResult>;

  /** Estudiantes con matrícula ACTIVA en la asignatura. */
  listActiveStudentIds(subjectId: string): Promise<string[]>;
  listSectionCourses(sectionId: string): Promise<CourseSummary[]>;
  /** Asignaturas de todos los paralelos de un año lectivo. */
  listSchoolYearCourses(schoolYearId: string): Promise<CourseSummary[]>;

  closePeriod(periodId: string, userId: string, results: PeriodResult[], event: PeriodClosureEvent): Promise<void>;
  reopenPeriod(periodId: string, event: PeriodClosureEvent): Promise<void>;
  listClosureEvents(periodId: string): Promise<PeriodClosureEvent[]>;
  listPeriodResults(filter: { studentId?: string; subjectId?: string; periodId?: string }): Promise<PeriodResult[]>;

  listSupplementary(filter: { subjectId?: string; studentId?: string }): Promise<SupplementaryGrade[]>;
  upsertSupplementary(entries: SupplementaryGrade[]): Promise<void>;

  getDecision(studentEnrollmentId: string): Promise<PromotionDecision | null>;
  listDecisions(studentEnrollmentIds: string[]): Promise<PromotionDecision[]>;
  /** Guarda la decisión y actualiza la matrícula (PROMOTED / REPEATED) en una transacción. */
  saveDecision(decision: PromotionDecision): Promise<void>;
}
