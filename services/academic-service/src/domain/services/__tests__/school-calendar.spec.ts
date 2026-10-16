import {
  addDays,
  buildCalendarWarnings,
  countWeekdays,
  derivePeriodStatus,
  findCurrentRange,
  generatePeriodRanges,
  validatePeriodRanges,
  validateSchoolYearDates,
} from '../school-calendar';

describe('school-calendar', () => {
  describe('generatePeriodRanges', () => {
    it('divide el año en 3 periodos consecutivos sin huecos ni traslapes', () => {
      const ranges = generatePeriodRanges('2025-09-01', '2026-06-26', 3);

      expect(ranges).toHaveLength(3);
      expect(ranges[0].startDate).toBe('2025-09-01');
      expect(ranges[2].endDate).toBe('2026-06-26');
      expect(addDays(ranges[0].endDate, 1)).toBe(ranges[1].startDate);
      expect(addDays(ranges[1].endDate, 1)).toBe(ranges[2].startDate);
      expect(validatePeriodRanges('2025-09-01', '2026-06-26', ranges)).toEqual([]);
    });

    it('soporta quimestres (2 periodos)', () => {
      const ranges = generatePeriodRanges('2025-09-01', '2026-06-26', 2);
      expect(ranges).toHaveLength(2);
      expect(ranges[1].endDate).toBe('2026-06-26');
    });
  });

  describe('validateSchoolYearDates', () => {
    const base = { startDate: '2025-09-01', endDate: '2026-06-26' };

    it('acepta un calendario con recuperación y supletorios posteriores', () => {
      expect(
        validateSchoolYearDates({
          ...base,
          recoveryStartDate: '2026-06-29',
          recoveryEndDate: '2026-07-03',
          supplementaryStartDate: '2026-07-06',
          supplementaryEndDate: '2026-07-09',
        }),
      ).toEqual([]);
    });

    it('rechaza inicio posterior al fin', () => {
      expect(
        validateSchoolYearDates({ startDate: '2026-06-26', endDate: '2025-09-01' }),
      ).toContain('La fecha de inicio debe ser anterior a la fecha de fin');
    });

    it('rechaza supletorios antes de terminar la recuperación', () => {
      const errors = validateSchoolYearDates({
        ...base,
        recoveryStartDate: '2026-06-29',
        recoveryEndDate: '2026-07-03',
        supplementaryStartDate: '2026-07-01',
        supplementaryEndDate: '2026-07-09',
      });
      expect(errors).toContain('Los supletorios deben iniciar después de la recuperación');
    });

    it('rechaza recuperación que inicia dentro del año de clases', () => {
      const errors = validateSchoolYearDates({
        ...base,
        recoveryStartDate: '2026-06-01',
        recoveryEndDate: '2026-06-05',
      });
      expect(errors).toContain('La recuperación debe iniciar después del fin de clases');
    });

    it('exige inicio y fin cuando se informa una de las dos fechas', () => {
      const errors = validateSchoolYearDates({
        ...base,
        recoveryStartDate: '2026-06-29',
      });
      expect(errors.some((e) => e.startsWith('Recuperación'))).toBe(true);
    });
  });

  describe('validatePeriodRanges', () => {
    it('detecta traslape y salida del año lectivo', () => {
      const errors = validatePeriodRanges('2025-09-01', '2026-06-26', [
        { number: 1, startDate: '2025-09-01', endDate: '2025-12-15' },
        { number: 2, startDate: '2025-12-10', endDate: '2026-07-30' },
      ]);
      expect(errors).toEqual(
        expect.arrayContaining([
          'Periodo 2: se traslapa con el periodo 1',
          'Periodo 2: debe estar dentro del año lectivo',
        ]),
      );
    });
  });

  describe('calendario', () => {
    it('cuenta solo días laborables', () => {
      // lunes 2025-09-01 a domingo 2025-09-07 → 5 días laborables
      expect(countWeekdays('2025-09-01', '2025-09-07')).toBe(5);
    });

    it('avisa cuando los días laborables no alcanzan el mínimo', () => {
      expect(buildCalendarWarnings('2025-09-01', '2025-12-01', 200)).toHaveLength(1);
      expect(buildCalendarWarnings('2025-09-01', '2026-06-26', 200)).toEqual([]);
    });

    it('deriva el periodo vigente por fecha', () => {
      const ranges = generatePeriodRanges('2025-09-01', '2026-06-26', 3);
      expect(findCurrentRange(ranges, '2025-09-15')?.number).toBe(1);
      expect(findCurrentRange(ranges, '2026-06-26')?.number).toBe(3);
      expect(findCurrentRange(ranges, '2026-08-01')).toBeNull();
    });
  });

  describe('derivePeriodStatus', () => {
    const range = { startDate: '2025-09-01', endDate: '2025-12-15' };

    it('marca el periodo según la fecha', () => {
      expect(derivePeriodStatus(range, '2025-08-31')).toBe('PLANNED');
      expect(derivePeriodStatus(range, '2025-09-01')).toBe('ACTIVE');
      expect(derivePeriodStatus(range, '2025-12-15')).toBe('ACTIVE');
      expect(derivePeriodStatus(range, '2025-12-16')).toBe('FINISHED');
    });
  });
});
