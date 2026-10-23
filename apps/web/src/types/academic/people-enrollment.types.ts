export type GuardianRelation = "MOTHER" | "FATHER" | "LEGAL_GUARDIAN" | "OTHER";
export type Sex = "F" | "M" | "X";
export type ConsentPurpose = "DATA_PROCESSING" | "IMAGE_USE" | "AI_ANALYSIS";
export type StudentEnrollmentStatus =
  | "ACTIVE"
  | "WITHDRAWN"
  | "TRANSFERRED"
  | "PROMOTED"
  | "REPEATED";

export interface StudentProfile {
  studentId: string;
  birthDate: string | null;
  sex: Sex | null;
  nationality: string | null;
  address: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  previousSchool: string | null;
}

export type StudentProfilePayload = Omit<StudentProfile, "studentId">;

export interface GuardianLink {
  guardianId: string;
  studentId: string;
  guardianName: string;
  studentName: string;
  relation: GuardianRelation;
  isPrimary: boolean;
  canPickup: boolean;
  livesWith: boolean;
}

export interface LinkGuardianPayload {
  guardianId: string;
  relation: GuardianRelation;
  isPrimary?: boolean;
  canPickup?: boolean;
  livesWith?: boolean;
}

export interface Consent {
  id: string;
  studentId: string;
  guardianId: string;
  purpose: ConsentPurpose;
  noticeVersion: string;
  grantedAt: string;
  revokedAt: string | null;
}

export interface SectionEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  sectionId: string;
  schoolYearId: string;
  status: StudentEnrollmentStatus;
  enrolledAt: string;
  endedAt: string | null;
  notes: string | null;
}

export interface EnrollmentResult {
  studentId: string;
  ok: boolean;
  enrollmentId?: string;
  errors: string[];
  warnings: string[];
}

export interface MyStudent extends GuardianLink {
  activeEnrollment: {
    id: string;
    sectionName: string | null;
    gradeName: string | null;
    shift: string | null;
  } | null;
}

export const RELATION_LABELS: Record<GuardianRelation, string> = {
  MOTHER: "Madre",
  FATHER: "Padre",
  LEGAL_GUARDIAN: "Tutor legal",
  OTHER: "Otro",
};

export const CONSENT_LABELS: Record<ConsentPurpose, { title: string; description: string }> = {
  DATA_PROCESSING: {
    title: "Tratamiento de datos personales",
    description:
      "Autorizo el tratamiento de los datos personales y académicos del estudiante para la gestión escolar.",
  },
  IMAGE_USE: {
    title: "Uso de imagen",
    description:
      "Autorizo el uso de fotografías y videos del estudiante en actividades institucionales.",
  },
  AI_ANALYSIS: {
    title: "Análisis con inteligencia artificial",
    description:
      "Autorizo que el desempeño del estudiante sea analizado con apoyo de IA para detectar a tiempo riesgos de rezago o abandono. Las alertas siempre las revisa una persona.",
  },
};

export const ENROLLMENT_STATUS_LABELS: Record<StudentEnrollmentStatus, string> = {
  ACTIVE: "Matriculado",
  WITHDRAWN: "Retirado",
  TRANSFERRED: "Trasladado",
  PROMOTED: "Promovido",
  REPEATED: "Repite",
};
