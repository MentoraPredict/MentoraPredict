export type SchoolRegime = "SIERRA_AMAZONIA" | "COSTA_GALAPAGOS";
export type PeriodScheme = "TRIMESTER" | "QUIMESTER" | "SEMESTER";
export type SchoolYearStatus = "PLANNED" | "ACTIVE" | "FINISHED";

export interface GradingPeriod {
  id: string;
  name: string;
  code: string;
  number: number | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  gradesDueDate: string | null;
  isCurrent: boolean;
  isClosed: boolean;
}

export interface SchoolYear {
  id: string;
  name: string;
  code: string;
  regime: SchoolRegime;
  periodScheme: PeriodScheme;
  periodsCount: number;
  startDate: string;
  endDate: string;
  minClassDays: number;
  recoveryStartDate: string | null;
  recoveryEndDate: string | null;
  supplementaryStartDate: string | null;
  supplementaryEndDate: string | null;
  status: SchoolYearStatus;
  periods: GradingPeriod[];
  currentPeriodId: string | null;
  warnings: string[];
}

export interface CreateSchoolYearPayload {
  name: string;
  code: string;
  regime: SchoolRegime;
  periodScheme: PeriodScheme;
  periodsCount?: number;
  startDate: string;
  endDate: string;
  minClassDays?: number;
  recoveryStartDate?: string;
  recoveryEndDate?: string;
  supplementaryStartDate?: string;
  supplementaryEndDate?: string;
}

export interface UpdateGradingPeriodPayload {
  startDate?: string;
  endDate?: string;
  gradesDueDate?: string | null;
}

export const REGIME_LABELS: Record<SchoolRegime, string> = {
  SIERRA_AMAZONIA: "Sierra - Amazonía",
  COSTA_GALAPAGOS: "Costa - Galápagos",
};

export const SCHEME_LABELS: Record<PeriodScheme, string> = {
  TRIMESTER: "Trimestres",
  QUIMESTER: "Quimestres",
  SEMESTER: "Semestres",
};

export const DEFAULT_PERIODS_BY_SCHEME: Record<PeriodScheme, number> = {
  TRIMESTER: 3,
  QUIMESTER: 2,
  SEMESTER: 2,
};

export const STATUS_LABELS: Record<SchoolYearStatus, string> = {
  PLANNED: "Planificado",
  ACTIVE: "En curso",
  FINISHED: "Finalizado",
};
