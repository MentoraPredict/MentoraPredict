import type { SchoolRegime } from "./school-year.types";

export type Sustentation =
  | "FISCAL"
  | "FISCOMISIONAL"
  | "MUNICIPAL"
  | "PARTICULAR";
export type Shift = "MATUTINA" | "VESPERTINA" | "NOCTURNA";
export type RepetitionPolicy = "NOT_APPLICABLE" | "FAMILY_REQUEST" | "BY_GRADE";

export interface Institution {
  id: string;
  amie: string | null;
  name: string;
  sustentation: Sustentation;
  regime: SchoolRegime;
  zone: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  rectorName: string | null;
  logoUrl: string | null;
}

export interface EducationLevel {
  code: string;
  name: string;
  levelGroup: "INICIAL" | "EGB" | "BACHILLERATO";
  sortOrder: number;
  evaluationMode: "QUALITATIVE" | "MIXED";
  allowsSupplementary: boolean;
}

export interface InstitutionLevel {
  levelCode: string;
  isActive: boolean;
  shifts: Shift[];
}

export interface GradingScaleBand {
  code: string;
  label: string;
  minValue: number;
  maxValue: number;
}

export interface GradingScale {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  passingGrade: number;
  decimals: number;
  bands: GradingScaleBand[];
}

export interface AttendanceRule {
  maxUnjustifiedPct: number;
  warningPcts: number[];
  appliesFromLevelOrder: number;
  justificationDays: number | null;
}

export interface PromotionRule {
  levelCode: string;
  minAverage: number;
  allowsSupplementary: boolean;
  supplementaryMinAverage: number;
  repetitionPolicy: RepetitionPolicy;
}

export interface InstitutionConfig {
  institution: Institution;
  levelCatalog: EducationLevel[];
  levels: InstitutionLevel[];
  gradingScale: GradingScale;
  attendanceRule: AttendanceRule;
  promotionRules: PromotionRule[];
}

export const SUSTENTATION_LABELS: Record<Sustentation, string> = {
  FISCAL: "Fiscal",
  FISCOMISIONAL: "Fiscomisional",
  MUNICIPAL: "Municipal",
  PARTICULAR: "Particular",
};

export const SHIFT_LABELS: Record<Shift, string> = {
  MATUTINA: "Matutina",
  VESPERTINA: "Vespertina",
  NOCTURNA: "Nocturna",
};

export const REPETITION_POLICY_LABELS: Record<RepetitionPolicy, string> = {
  NOT_APPLICABLE: "No aplica",
  FAMILY_REQUEST: "La solicita la familia",
  BY_GRADE: "Por calificación",
};
