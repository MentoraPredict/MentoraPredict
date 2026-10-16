import {
  Consent,
  ConsentPurpose,
  GuardianLink,
  StudentProfile,
} from '../../../domain/entities/people.entity';

export const PEOPLE_REPOSITORY_TOKEN = 'IPeopleRepository';

export interface IPeopleRepository {
  getStudentProfile(studentId: string): Promise<StudentProfile | null>;
  saveStudentProfile(profile: StudentProfile): Promise<StudentProfile>;

  listGuardiansOfStudent(studentId: string): Promise<GuardianLink[]>;
  listStudentsOfGuardian(guardianId: string): Promise<GuardianLink[]>;
  findGuardianLink(guardianId: string, studentId: string): Promise<GuardianLink | null>;
  /** Guarda el vínculo y degrada al principal anterior en la misma transacción. */
  saveGuardianLink(link: GuardianLink, demoteGuardianIds: string[]): Promise<GuardianLink>;
  deleteGuardianLink(guardianId: string, studentId: string): Promise<void>;

  listConsents(studentId: string): Promise<Consent[]>;
  findActiveConsent(studentId: string, purpose: ConsentPurpose): Promise<Consent | null>;
  saveConsent(consent: Consent): Promise<Consent>;
  revokeConsent(id: string, revokedAt: Date): Promise<void>;
}
