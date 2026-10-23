import { GuardianLink } from '../../entities/people.entity';
import {
  checkEnrollment,
  pickPrimaryAfterLink,
  validateConsentPurpose,
  validateGuardianLink,
  validateStudentProfile,
} from '../people-enrollment';

const link = (over: Partial<GuardianLink> = {}): GuardianLink => ({
  guardianId: 'g1',
  studentId: 's1',
  relation: 'MOTHER',
  isPrimary: true,
  canPickup: true,
  livesWith: true,
  ...over,
});

describe('people-enrollment', () => {
  describe('validateStudentProfile', () => {
    it('acepta una ficha válida', () => {
      expect(
        validateStudentProfile({ birthDate: '2012-05-10', sex: 'F', hasSpecialNeeds: false }, '2026-10-16'),
      ).toEqual([]);
    });

    it('rechaza fechas futuras, inválidas e implausibles', () => {
      expect(validateStudentProfile({ birthDate: '2030-01-01' }, '2026-10-16')).toContain(
        'La fecha de nacimiento no puede ser futura',
      );
      expect(validateStudentProfile({ birthDate: '2012-13-45' }, '2026-10-16')).toContain(
        'La fecha de nacimiento no es válida (YYYY-MM-DD)',
      );
      expect(validateStudentProfile({ birthDate: '1950-01-01' }, '2026-10-16')).toContain(
        'La fecha de nacimiento no es plausible para un estudiante',
      );
    });

    it('detecta notas de NEE sin la marca correspondiente', () => {
      expect(
        validateStudentProfile({ hasSpecialNeeds: false, specialNeedsNotes: 'dislexia' }, '2026-10-16'),
      ).toHaveLength(1);
    });
  });

  describe('validateGuardianLink', () => {
    it('rechaza que el representante sea el propio estudiante', () => {
      expect(validateGuardianLink(link({ guardianId: 's1' }))).toContain(
        'El representante y el estudiante no pueden ser la misma persona',
      );
    });

    it('rechaza parentescos desconocidos', () => {
      expect(validateGuardianLink(link({ relation: 'COUSIN' as never }))).toContain('El parentesco no es válido');
    });
  });

  describe('validateConsentPurpose', () => {
    it('solo acepta las finalidades definidas', () => {
      expect(validateConsentPurpose('AI_ANALYSIS')).toEqual([]);
      expect(validateConsentPurpose('MARKETING')).toHaveLength(1);
    });
  });

  describe('checkEnrollment', () => {
    const ok = {
      activeStudentsInSection: 10,
      sectionCapacity: 30,
      hasActiveEnrollmentInYear: false,
      hasPrimaryGuardian: true,
      hasDataProcessingConsent: true,
    };

    it('permite matricular sin errores ni avisos', () => {
      expect(checkEnrollment(ok)).toEqual({ errors: [], warnings: [] });
    });

    it('bloquea por cupo lleno o matrícula duplicada', () => {
      const result = checkEnrollment({ ...ok, activeStudentsInSection: 30, hasActiveEnrollmentInYear: true });
      expect(result.errors).toEqual([
        'El estudiante ya tiene una matrícula activa en este año lectivo',
        'El paralelo no tiene cupo disponible',
      ]);
    });

    it('avisa sin bloquear cuando falta representante o consentimiento', () => {
      const result = checkEnrollment({ ...ok, hasPrimaryGuardian: false, hasDataProcessingConsent: false });
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(2);
    });
  });

  describe('pickPrimaryAfterLink', () => {
    it('degrada al representante principal anterior', () => {
      const existing = [link({ guardianId: 'g1', isPrimary: true }), link({ guardianId: 'g2', isPrimary: false })];
      expect(pickPrimaryAfterLink(existing, link({ guardianId: 'g3', isPrimary: true }))).toEqual({
        demoteGuardianIds: ['g1'],
      });
      expect(pickPrimaryAfterLink(existing, link({ guardianId: 'g3', isPrimary: false }))).toEqual({
        demoteGuardianIds: [],
      });
    });
  });
});
