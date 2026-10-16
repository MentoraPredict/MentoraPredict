import {
  pickAnchorPeriod,
  planCourseGeneration,
  validateCurriculum,
  validateSection,
} from '../academic-structure';

const level = { levelCode: 'EGB_SUPERIOR', isActive: true, shifts: ['MATUTINA' as const] };

describe('academic-structure', () => {
  describe('validateSection', () => {
    it('acepta un paralelo válido', () => {
      expect(validateSection({ name: 'A', capacity: 30, shift: 'MATUTINA' }, level)).toEqual([]);
    });

    it('rechaza nombre vacío, cupo inválido y jornada no habilitada', () => {
      const errors = validateSection({ name: ' ', capacity: 0, shift: 'NOCTURNA' }, level);
      expect(errors).toEqual(
        expect.arrayContaining([
          'El nombre del paralelo es obligatorio',
          'El cupo debe ser un entero entre 1 y 100',
          'La jornada no está habilitada para este nivel',
        ]),
      );
    });

    it('rechaza niveles inactivos o inexistentes', () => {
      const msg = 'El nivel de este grado no está activo en la institución';
      expect(validateSection({ name: 'A', capacity: 30, shift: 'MATUTINA' }, undefined)).toContain(msg);
      expect(
        validateSection({ name: 'A', capacity: 30, shift: 'MATUTINA' }, { ...level, isActive: false }),
      ).toContain(msg);
    });
  });

  describe('validateCurriculum', () => {
    it('detecta asignaturas repetidas y horas fuera de rango', () => {
      const errors = validateCurriculum([
        { gradeLevelCode: 'EGB_8', subjectCatalogId: 'a', weeklyHours: 5 },
        { gradeLevelCode: 'EGB_8', subjectCatalogId: 'a', weeklyHours: 0 },
      ]);
      expect(errors).toEqual([
        'Hay asignaturas repetidas en la malla',
        'La carga horaria semanal debe estar entre 1 y 40 horas',
      ]);
    });
  });

  describe('planCourseGeneration', () => {
    it('solo propone las asignaturas aún no ofertadas', () => {
      const plan = planCourseGeneration(
        [
          { gradeLevelCode: 'EGB_8', subjectCatalogId: 'mat', weeklyHours: 5 },
          { gradeLevelCode: 'EGB_8', subjectCatalogId: 'len', weeklyHours: 5 },
        ],
        new Set(['mat']),
      );
      expect(plan.toCreate.map((c) => c.subjectCatalogId)).toEqual(['len']);
      expect(plan.alreadyOffered).toBe(1);
    });
  });

  describe('pickAnchorPeriod', () => {
    const periods = [
      { id: 'p1', startDate: '2025-09-01', endDate: '2025-12-15' },
      { id: 'p2', startDate: '2025-12-16', endDate: '2026-03-31' },
      { id: 'p3', startDate: '2026-04-01', endDate: '2026-06-26' },
    ];

    it('elige el periodo vigente, el siguiente o el último', () => {
      expect(pickAnchorPeriod(periods, '2026-01-10')?.id).toBe('p2');
      expect(pickAnchorPeriod(periods, '2025-08-01')?.id).toBe('p1');
      expect(pickAnchorPeriod(periods, '2026-09-01')?.id).toBe('p3');
      expect(pickAnchorPeriod([], '2026-01-10')).toBeNull();
    });
  });
});
