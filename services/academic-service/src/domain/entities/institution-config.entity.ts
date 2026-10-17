import { SchoolRegime } from './school-year.entity';

export type Sustentation = 'FISCAL' | 'FISCOMISIONAL' | 'MUNICIPAL' | 'PARTICULAR';
export type Shift = 'MATUTINA' | 'VESPERTINA' | 'NOCTURNA';
export type EvaluationMode = 'QUALITATIVE' | 'MIXED';
export type RepetitionPolicy = 'NOT_APPLICABLE' | 'FAMILY_REQUEST' | 'BY_GRADE';

export const SUSTENTATIONS: Sustentation[] = [
  'FISCAL',
  'FISCOMISIONAL',
  'MUNICIPAL',
  'PARTICULAR',
];
export const SHIFTS: Shift[] = ['MATUTINA', 'VESPERTINA', 'NOCTURNA'];
export const REPETITION_POLICIES: RepetitionPolicy[] = [
  'NOT_APPLICABLE',
  'FAMILY_REQUEST',
  'BY_GRADE',
];

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

/** Nivel oficial del sistema educativo. Lo administra el sistema, no el usuario. */
export interface EducationLevel {
  code: string;
  name: string;
  levelGroup: 'INICIAL' | 'EGB' | 'BACHILLERATO';
  sortOrder: number;
  evaluationMode: EvaluationMode;
  allowsSupplementary: boolean;
}

/** Nivel que la institución decide ofrecer, con sus jornadas. */
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
  /** Promedio anual mínimo para poder rendir el supletorio. */
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

/**
 * Por ahora cada instalación es una institución. Las tablas ya llevan
 * `institution_id` para soportar varias más adelante sin cambiar el modelo.
 */
export const DEFAULT_INSTITUTION_ID = '00000000-0000-4000-8000-000000000001';
