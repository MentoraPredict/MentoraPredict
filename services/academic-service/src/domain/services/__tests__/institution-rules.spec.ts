import {
  AttendanceRule,
  EducationLevel,
  GradingScale,
  PromotionRule,
} from '../../entities/institution-config.entity';
import {
  isPassing,
  qualitativeFor,
  validateAttendanceRule,
  validateGradingScale,
  validateInstitution,
  validateInstitutionLevels,
  validatePromotionRules,
} from '../institution-rules';

const catalog: EducationLevel[] = [
  { code: 'EGB_ELEMENTAL', name: 'Elemental', levelGroup: 'EGB', sortOrder: 3, evaluationMode: 'QUALITATIVE', allowsSupplementary: false },
  { code: 'EGB_MEDIA', name: 'Media', levelGroup: 'EGB', sortOrder: 4, evaluationMode: 'MIXED', allowsSupplementary: true },
  { code: 'BGU', name: 'BGU', levelGroup: 'BACHILLERATO', sortOrder: 6, evaluationMode: 'MIXED', allowsSupplementary: true },
];

const scale = (): GradingScale => ({
  id: 's1',
  name: 'Escala',
  minValue: 0,
  maxValue: 10,
  passingGrade: 7,
  decimals: 2,
  bands: [
    { code: 'NAAR', label: 'No alcanza', minValue: 0, maxValue: 4 },
    { code: 'PAAR', label: 'Próximo a alcanzar', minValue: 4.01, maxValue: 6.99 },
    { code: 'AAR', label: 'Alcanza', minValue: 7, maxValue: 8.99 },
    { code: 'DAR', label: 'Domina', minValue: 9, maxValue: 10 },
  ],
});

describe('institution-rules', () => {
  describe('validateGradingScale', () => {
    it('acepta una escala continua de 0 a 10', () => {
      expect(validateGradingScale(scale())).toEqual([]);
    });

    it('detecta un hueco entre rangos', () => {
      const s = scale();
      s.bands[1].minValue = 4.5;
      expect(validateGradingScale(s)).toContain('Hay un hueco entre los rangos NAAR y PAAR');
    });

    it('detecta traslape entre rangos', () => {
      const s = scale();
      s.bands[2].minValue = 6.5;
      expect(validateGradingScale(s)).toContain('Los rangos PAAR y AAR se traslapan');
    });

    it('exige cubrir toda la escala', () => {
      const s = scale();
      s.bands[3].maxValue = 9.5;
      expect(validateGradingScale(s)).toContain('El último rango debe terminar en el máximo de la escala');
    });

    it('rechaza una nota de aprobación fuera de la escala', () => {
      const s = scale();
      s.passingGrade = 11;
      expect(validateGradingScale(s)).toContain('La nota de aprobación debe estar dentro de la escala');
    });
  });

  describe('equivalencias', () => {
    it('obtiene el rango cualitativo y si aprueba', () => {
      const s = scale();
      expect(qualitativeFor(s, 9.5)?.code).toBe('DAR');
      expect(qualitativeFor(s, 6.99)?.code).toBe('PAAR');
      expect(qualitativeFor(s, 7)?.code).toBe('AAR');
      expect(isPassing(s, 6.99)).toBe(false);
      expect(isPassing(s, 7)).toBe(true);
    });
  });

  describe('validateAttendanceRule', () => {
    const rule = (): AttendanceRule => ({
      maxUnjustifiedPct: 10,
      warningPcts: [5, 8],
      appliesFromLevelOrder: 5,
      justificationDays: null,
    });

    it('acepta la regla por defecto', () => {
      expect(validateAttendanceRule(rule())).toEqual([]);
    });

    it('rechaza avisos iguales o mayores al máximo', () => {
      const r = rule();
      r.warningPcts = [5, 10];
      expect(validateAttendanceRule(r)).toContain(
        'Los avisos deben ser mayores que 0 y menores que el máximo permitido',
      );
    });
  });

  describe('validateInstitutionLevels', () => {
    it('exige jornada en los niveles activos', () => {
      const errors = validateInstitutionLevels(
        [{ levelCode: 'BGU', isActive: true, shifts: [] }],
        catalog,
      );
      expect(errors).toContain('BGU: un nivel activo necesita al menos una jornada');
    });

    it('rechaza niveles que no existen en el catálogo', () => {
      const errors = validateInstitutionLevels(
        [{ levelCode: 'X', isActive: true, shifts: ['MATUTINA'] }],
        catalog,
      );
      expect(errors).toContain('Nivel desconocido: X');
    });

    it('acepta una oferta válida', () => {
      expect(
        validateInstitutionLevels(
          [{ levelCode: 'BGU', isActive: true, shifts: ['MATUTINA', 'VESPERTINA'] }],
          catalog,
        ),
      ).toEqual([]);
    });
  });

  describe('validatePromotionRules', () => {
    const rule = (over: Partial<PromotionRule>): PromotionRule => ({
      levelCode: 'EGB_MEDIA',
      minAverage: 7,
      allowsSupplementary: true,
      supplementaryMinAverage: 4,
      repetitionPolicy: 'FAMILY_REQUEST',
      ...over,
    });

    it('acepta una regla coherente', () => {
      expect(validatePromotionRules([rule({})], catalog, scale())).toEqual([]);
    });

    it('exige que el promedio para supletorio sea menor al promedio mínimo', () => {
      const errors = validatePromotionRules([rule({ supplementaryMinAverage: 7 })], catalog, scale());
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('supletorio');
    });

    it('no permite supletorio en niveles que no lo admiten', () => {
      const errors = validatePromotionRules(
        [rule({ levelCode: 'EGB_ELEMENTAL', allowsSupplementary: true })],
        catalog,
        scale(),
      );
      expect(errors).toContain('EGB_ELEMENTAL: este nivel no admite examen supletorio');
    });

    it('exige un promedio dentro de la escala', () => {
      const errors = validatePromotionRules([rule({ minAverage: 12 })], catalog, scale());
      expect(errors).toContain('EGB_MEDIA: el promedio mínimo debe estar dentro de la escala');
    });
  });

  describe('validateInstitution', () => {
    it('valida AMIE, correo y sostenimiento', () => {
      expect(validateInstitution({ name: 'Colegio', amie: '17H00001', email: 'a@b.ec', sustentation: 'FISCAL' })).toEqual([]);
      expect(validateInstitution({ amie: '!!' }).length).toBe(1);
      expect(validateInstitution({ email: 'malo' }).length).toBe(1);
      expect(validateInstitution({ name: '  ' }).length).toBe(1);
    });
  });
});
