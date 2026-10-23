import {
  CONSENT_PURPOSES,
  GUARDIAN_RELATIONS,
  GuardianLink,
  SEX_VALUES,
  StudentProfile,
} from '../entities/people.entity';
import { isIsoDate } from './school-calendar';

/**
 * Reglas de personas y matrícula. Funciones puras: devuelven los errores
 * bloqueantes (lista vacía = válido) o avisos no bloqueantes.
 */

// Cota de cordura para la fecha de nacimiento de un estudiante escolar.
const MAX_STUDENT_AGE_YEARS = 40;

export function validateStudentProfile(
  profile: Partial<StudentProfile>,
  today: string,
): string[] {
  const errors: string[] = [];

  if (profile.birthDate) {
    if (!isIsoDate(profile.birthDate)) {
      errors.push('La fecha de nacimiento no es válida (YYYY-MM-DD)');
    } else if (profile.birthDate > today) {
      errors.push('La fecha de nacimiento no puede ser futura');
    } else {
      const minYear = Number(today.slice(0, 4)) - MAX_STUDENT_AGE_YEARS;
      if (Number(profile.birthDate.slice(0, 4)) < minYear) {
        errors.push('La fecha de nacimiento no es plausible para un estudiante');
      }
    }
  }
  if (profile.sex && !SEX_VALUES.includes(profile.sex)) {
    errors.push('El sexo no es válido');
  }
  if (profile.hasSpecialNeeds === false && profile.specialNeedsNotes?.trim()) {
    errors.push('Hay notas de necesidades educativas especiales pero no se marcó que las tenga');
  }
  return errors;
}

export function validateGuardianLink(link: GuardianLink): string[] {
  const errors: string[] = [];

  if (link.guardianId === link.studentId) {
    errors.push('El representante y el estudiante no pueden ser la misma persona');
  }
  if (!GUARDIAN_RELATIONS.includes(link.relation)) {
    errors.push('El parentesco no es válido');
  }
  return errors;
}

export function validateConsentPurpose(purpose: string): string[] {
  return (CONSENT_PURPOSES as readonly string[]).includes(purpose)
    ? []
    : ['La finalidad del consentimiento no es válida'];
}

export interface EnrollmentContext {
  activeStudentsInSection: number;
  sectionCapacity: number;
  hasActiveEnrollmentInYear: boolean;
  hasPrimaryGuardian: boolean;
  hasDataProcessingConsent: boolean;
}

export interface EnrollmentCheck {
  errors: string[];
  warnings: string[];
}

/** Errores que impiden matricular y avisos que no lo impiden. */
export function checkEnrollment(ctx: EnrollmentContext): EnrollmentCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (ctx.hasActiveEnrollmentInYear) {
    errors.push('El estudiante ya tiene una matrícula activa en este año lectivo');
  }
  if (ctx.activeStudentsInSection >= ctx.sectionCapacity) {
    errors.push('El paralelo no tiene cupo disponible');
  }
  if (!ctx.hasPrimaryGuardian) {
    warnings.push('El estudiante no tiene un representante principal registrado');
  }
  if (!ctx.hasDataProcessingConsent) {
    warnings.push('El representante aún no otorgó el consentimiento de tratamiento de datos');
  }
  return { errors, warnings };
}

/** Un estudiante solo puede tener un representante principal. */
export function pickPrimaryAfterLink(
  existing: GuardianLink[],
  incoming: GuardianLink,
): { demoteGuardianIds: string[] } {
  if (!incoming.isPrimary) return { demoteGuardianIds: [] };
  return {
    demoteGuardianIds: existing
      .filter((l) => l.isPrimary && l.guardianId !== incoming.guardianId)
      .map((l) => l.guardianId),
  };
}
