export const GUARDIAN_RELATIONS = ['MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'OTHER'] as const;
export type GuardianRelation = (typeof GUARDIAN_RELATIONS)[number];

export const SEX_VALUES = ['F', 'M', 'X'] as const;
export type Sex = (typeof SEX_VALUES)[number];

/**
 * Finalidades de tratamiento que requieren consentimiento del representante
 * (LOPDP). AI_ANALYSIS condiciona el uso de predicción/IA sobre el menor.
 */
export const CONSENT_PURPOSES = ['DATA_PROCESSING', 'IMAGE_USE', 'AI_ANALYSIS'] as const;
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export const STUDENT_ENROLLMENT_STATUSES = [
  'ACTIVE',
  'WITHDRAWN',
  'TRANSFERRED',
  'PROMOTED',
  'REPEATED',
] as const;
export type StudentEnrollmentStatus = (typeof STUDENT_ENROLLMENT_STATUSES)[number];

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

export interface GuardianLink {
  guardianId: string;
  studentId: string;
  relation: GuardianRelation;
  isPrimary: boolean;
  canPickup: boolean;
  livesWith: boolean;
}

export interface Consent {
  id: string;
  studentId: string;
  guardianId: string;
  purpose: ConsentPurpose;
  noticeVersion: string;
  grantedAt: Date;
  revokedAt: Date | null;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  sectionId: string;
  schoolYearId: string;
  status: StudentEnrollmentStatus;
  enrolledAt: Date;
  endedAt: Date | null;
  notes: string | null;
}
