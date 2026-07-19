import type { IconType } from "react-icons";

export type SurveyStepFieldType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "NUMBER"
  | "TEXT"
  | "BOOLEAN"
  | "SELECT"
  | "MATRIX";

export interface SurveyStepField {
  id: string;
  label: string;
  type: SurveyStepFieldType;
  options?: string[];
  /** Solo para MATRIX: filas (ej. temas del sílabo). */
  matrixRows?: string[];
  /** Solo para MATRIX: columnas (ej. escala Nada claro..Muy claro). */
  matrixColumns?: string[];
}

export interface SurveyStep {
  title: string;
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
}
