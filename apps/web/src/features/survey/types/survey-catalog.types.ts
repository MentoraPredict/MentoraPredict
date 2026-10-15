import type { IconType } from "react-icons";

export type SurveyStepFieldType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "NUMBER"
  | "TEXT"
  | "BOOLEAN"
  | "SELECT"
  | "MATRIX"
  | "SLIDER"
  | "RATING";

export interface SurveyStepField {
  id: string;
  label: string;
  type: SurveyStepFieldType;
  options?: string[];
  /** Solo para MATRIX: filas (ej. temas del sílabo). */
  matrixRows?: string[];
  /** Solo para MATRIX: columnas (ej. escala Nada claro..Muy claro). */
  matrixColumns?: string[];
  /** Solo para SLIDER. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
}

export interface SurveyStep {
  title: string;
  /** Texto opcional bajo el título del paso (ej. contexto del bloque de preguntas). */
  description?: string;
  fields: SurveyStepField[];
}

export type SurveyCategory = "Obligatoria" | "Opcional";

export interface SurveyDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: IconType;
  category: SurveyCategory;
  estimatedMinutes: number;
  /** false únicamente para la encuesta socioeconómica real (Fase D). */
  isMocked: boolean;
  /** Pasos fijos — solo se usan cuando isMocked === true; la encuesta real
   * arma sus pasos dinámicamente desde el catálogo de preguntas del backend. */
  steps?: SurveyStep[];
  /** false para encuestas que no se listan en /student/survey (ej. la del
   * sílabo, que se accede por materia desde CourseActionsToolbar y puede
   * repetirse cuantas veces haga falta, no encaja en el modelo "una vez" del
   * catálogo). El registro sigue existiendo para que getSurveyDefinition la
   * resuelva por id. Por defecto true. */
  showInCatalog?: boolean;
}
