import { GradingComponent } from '../../entities/grading.entity';
import { GradingScale, PromotionRule } from '../../entities/institution-config.entity';
import {
  computeAnnualAverage,
  computePeriodGrade,
  effectiveActivityWeights,
  resolveSubjectResult,
  suggestPromotion,
  validateGradeValue,
  validateGradingComponents,
} from '../grading-rules';

const components: GradingComponent[] = [
  { code: 'FORMATIVE', name: 'Formativa', weight: 70, sortOrder: 1 },
  { code: 'SUMMATIVE', name: 'Sumativa', weight: 30, sortOrder: 2 },
];

const scale: GradingScale = {
  id: 's',
  name: 'Escala',
  minValue: 0,
  maxValue: 10,
  passingGrade: 7,
  decimals: 2,
  bands: [],
};

const rule = (over: Partial<PromotionRule> = {}): PromotionRule => ({
  levelCode: 'EGB_MEDIA',
  minAverage: 7,
  allowsSupplementary: true,
  supplementaryMinAverage: 4,
  repetitionPolicy: 'BY_GRADE',
  ...over,
});

describe('grading-rules', () => {
  describe('validateGradingComponents', () => {
    it('acepta pesos que suman 100', () => {
      expect(validateGradingComponents(components)).toEqual([]);
    });

    it('rechaza pesos que no suman 100', () => {
      const errors = validateGradingComponents([{ ...components[0], weight: 60 }, components[1]]);
      expect(errors).toContain('Los pesos de los componentes deben sumar 100 (suman 90)');
    });

    it('rechaza códigos repetidos y pesos no positivos', () => {
      const errors = validateGradingComponents([
        { code: 'A', name: 'A', weight: 100, sortOrder: 1 },
        { code: 'A', name: 'B', weight: 0, sortOrder: 2 },
      ]);
      expect(errors).toContain('Componente repetido: A');
      expect(errors).toContain('A: el peso debe ser mayor que 0 y no superar 100');
    });

    it('exige al menos un componente', () => {
      expect(validateGradingComponents([])).toHaveLength(1);
    });
  });

  describe('validateGradeValue', () => {
    it('acepta valores dentro de la escala', () => {
      expect(validateGradeValue(scale, 0)).toBeNull();
      expect(validateGradeValue(scale, 10)).toBeNull();
      expect(validateGradeValue(scale, 8.45)).toBeNull();
    });

    it('rechaza valores fuera de rango, no numéricos o con demasiados decimales', () => {
      expect(validateGradeValue(scale, 10.01)).not.toBeNull();
      expect(validateGradeValue(scale, -1)).not.toBeNull();
      expect(validateGradeValue(scale, NaN)).not.toBeNull();
      expect(validateGradeValue(scale, '8' as unknown)).not.toBeNull();
      expect(validateGradeValue(scale, 8.456)).not.toBeNull();
    });

    it('respeta una escala distinta a 0–10', () => {
      expect(validateGradeValue({ ...scale, maxValue: 20 }, 15)).toBeNull();
    });
  });

  describe('computePeriodGrade', () => {
    it('pondera el promedio de cada componente', () => {
      const result = computePeriodGrade(
        components,
        [
          { componentCode: 'FORMATIVE', value: 8 },
          { componentCode: 'FORMATIVE', value: 10 },
          { componentCode: 'SUMMATIVE', value: 6 },
        ],
        scale,
      );
      // formativa 9 * 0.7 + sumativa 6 * 0.3 = 8.1
      expect(result.componentAverages).toEqual({ FORMATIVE: 9, SUMMATIVE: 6 });
      expect(result.value).toBe(8.1);
      expect(result.isComplete).toBe(true);
    });

    it('es parcial cuando falta un componente', () => {
      const result = computePeriodGrade(components, [{ componentCode: 'FORMATIVE', value: 8 }], scale);
      expect(result.value).toBe(8);
      expect(result.isComplete).toBe(false);
      expect(result.componentAverages.SUMMATIVE).toBeNull();
    });

    it('devuelve null sin notas', () => {
      const result = computePeriodGrade(components, [], scale);
      expect(result.value).toBeNull();
      expect(result.isComplete).toBe(false);
    });

    it('usa los pesos configurados, no los de la norma', () => {
      const custom = [
        { code: 'FORMATIVE', name: 'F', weight: 50, sortOrder: 1 },
        { code: 'SUMMATIVE', name: 'S', weight: 50, sortOrder: 2 },
      ];
      const result = computePeriodGrade(
        custom,
        [
          { componentCode: 'FORMATIVE', value: 10 },
          { componentCode: 'SUMMATIVE', value: 6 },
        ],
        scale,
      );
      expect(result.value).toBe(8);
    });
  });

  describe('effectiveActivityWeights', () => {
    const activity = (id: string, componentCode: string, periodId = 'p1', isActive = true) => ({
      id,
      periodId,
      componentCode,
      isActive,
    });

    it('reparte el peso del componente entre sus actividades del periodo', () => {
      const weights = effectiveActivityWeights(components, [
        activity('f1', 'FORMATIVE'),
        activity('f2', 'FORMATIVE'),
        activity('s1', 'SUMMATIVE'),
        activity('f3', 'FORMATIVE', 'p2'),
      ]);

      expect(weights.get('f1')).toBe(35);
      expect(weights.get('f2')).toBe(35);
      expect(weights.get('s1')).toBe(30);
      expect(weights.get('f3')).toBe(70);
    });

    it('ignora las actividades archivadas', () => {
      const weights = effectiveActivityWeights(components, [
        activity('f1', 'FORMATIVE'),
        activity('f2', 'FORMATIVE', 'p1', false),
      ]);

      expect(weights.get('f1')).toBe(70);
      expect(weights.has('f2')).toBe(false);
    });

    it('da el mismo promedio que la nota del periodo', () => {
      // formativa: 8 y 10; sumativa: 6 → 9 * 0.7 + 6 * 0.3 = 8.1
      const weights = effectiveActivityWeights(components, [
        activity('f1', 'FORMATIVE'),
        activity('f2', 'FORMATIVE'),
        activity('s1', 'SUMMATIVE'),
      ]);
      const grades = { f1: 8, f2: 10, s1: 6 } as Record<string, number>;
      const weighted = Object.entries(grades).reduce((sum, [id, v]) => sum + v * (weights.get(id) ?? 0), 0);

      expect(weighted / 100).toBeCloseTo(8.1, 6);
    });
  });

  describe('computeAnnualAverage', () => {
    it('promedia los periodos', () => {
      expect(computeAnnualAverage([7, 8, 9], scale)).toBe(8);
      expect(computeAnnualAverage([7.5, 8, 8], scale)).toBe(7.83);
    });

    it('es null si falta algún periodo', () => {
      expect(computeAnnualAverage([7, null, 9], scale)).toBeNull();
      expect(computeAnnualAverage([], scale)).toBeNull();
    });
  });

  describe('resolveSubjectResult', () => {
    it('aprueba con el mínimo del nivel', () => {
      expect(resolveSubjectResult({ annualAverage: 7, supplementaryGrade: null, rule: rule(), scale })).toEqual({
        status: 'APPROVED',
        finalGrade: 7,
      });
    });

    it('queda incompleto sin promedio anual', () => {
      expect(
        resolveSubjectResult({ annualAverage: null, supplementaryGrade: null, rule: rule(), scale }).status,
      ).toBe('INCOMPLETE');
    });

    it('pide supletorio entre el piso y el mínimo', () => {
      expect(
        resolveSubjectResult({ annualAverage: 5.5, supplementaryGrade: null, rule: rule(), scale }).status,
      ).toBe('SUPPLEMENTARY_PENDING');
    });

    it('aprueba o reprueba según el supletorio', () => {
      expect(
        resolveSubjectResult({ annualAverage: 5.5, supplementaryGrade: 7, rule: rule(), scale }),
      ).toEqual({ status: 'APPROVED', finalGrade: 7 });
      expect(
        resolveSubjectResult({ annualAverage: 5.5, supplementaryGrade: 6, rule: rule(), scale }),
      ).toEqual({ status: 'FAILED', finalGrade: 5.5 });
    });

    it('reprueba bajo el piso del supletorio', () => {
      expect(
        resolveSubjectResult({ annualAverage: 3.9, supplementaryGrade: null, rule: rule(), scale }).status,
      ).toBe('FAILED');
    });

    it('no ofrece supletorio si el nivel no lo admite', () => {
      expect(
        resolveSubjectResult({
          annualAverage: 5.5,
          supplementaryGrade: null,
          rule: rule({ allowsSupplementary: false }),
          scale,
        }).status,
      ).toBe('FAILED');
    });

    it('usa la nota de aprobación de la escala si el nivel no tiene regla', () => {
      expect(
        resolveSubjectResult({ annualAverage: 6.9, supplementaryGrade: null, rule: undefined, scale }).status,
      ).toBe('FAILED');
    });
  });

  describe('suggestPromotion', () => {
    const approved = { status: 'APPROVED' as const, finalGrade: 8 };
    const failed = { status: 'FAILED' as const, finalGrade: 5 };

    it('promueve cuando todo está aprobado', () => {
      expect(suggestPromotion({ results: [approved, approved], rule: rule() }).outcome).toBe('PROMOTED');
    });

    it('queda pendiente si falta algún promedio', () => {
      expect(
        suggestPromotion({ results: [approved, { status: 'INCOMPLETE', finalGrade: null }], rule: rule() })
          .outcome,
      ).toBe('PENDING');
    });

    it('queda pendiente de supletorio', () => {
      expect(
        suggestPromotion({
          results: [approved, { status: 'SUPPLEMENTARY_PENDING', finalGrade: null }],
          rule: rule(),
        }).outcome,
      ).toBe('PENDING_SUPPLEMENTARY');
    });

    it('repite en un nivel con política por grado', () => {
      const result = suggestPromotion({ results: [approved, failed], rule: rule() });
      expect(result.outcome).toBe('REPEATS');
      expect(result.reasons).toContain('1 asignatura(s) reprobadas');
    });

    it('envía a revisión cuando la repetición depende de la familia', () => {
      expect(
        suggestPromotion({ results: [failed], rule: rule({ repetitionPolicy: 'FAMILY_REQUEST' }) }).outcome,
      ).toBe('REVIEW');
    });

    it('promueve igual donde no hay repetición', () => {
      expect(
        suggestPromotion({ results: [failed], rule: rule({ repetitionPolicy: 'NOT_APPLICABLE' }) }).outcome,
      ).toBe('PROMOTED');
    });

    it('considera la asistencia', () => {
      const result = suggestPromotion({ results: [approved], rule: rule(), attendanceFailed: true });
      expect(result.outcome).toBe('REPEATS');
      expect(result.reasons).toContain('Superó el máximo de faltas injustificadas');
    });

    it('queda pendiente sin asignaturas', () => {
      expect(suggestPromotion({ results: [], rule: rule() }).outcome).toBe('PENDING');
    });
  });
});
