import { AttendanceRecord } from '../../entities/attendance.entity';
import { AttendanceRule } from '../../entities/institution-config.entity';
import {
  daysBetween,
  evaluateAttendance,
  isWithinJustificationWindow,
  isWorse,
  ruleApplies,
  summarizeAttendance,
} from '../attendance-rules';

const rule: AttendanceRule = {
  maxUnjustifiedPct: 10,
  warningPcts: [5, 8],
  appliesFromLevelOrder: 2,
  justificationDays: 3,
};

const record = (
  present: boolean,
  justification: AttendanceRecord['justification'] = null,
  sessionDate = '2026-10-01',
): AttendanceRecord => ({
  sessionId: `s-${Math.random()}`,
  subjectId: 'sub',
  studentId: 'stu',
  present,
  sessionDate,
  justification,
});

const records = (absent: number, total: number, justified = 0) => [
  ...Array.from({ length: total - absent }, () => record(true)),
  ...Array.from({ length: absent }, (_, i) => record(false, i < justified ? 'APPROVED' : null)),
];

describe('attendance-rules', () => {
  describe('summarizeAttendance', () => {
    it('no cuenta como injustificadas las faltas aprobadas', () => {
      const summary = summarizeAttendance(records(4, 40, 2));
      expect(summary).toEqual({ held: 40, absences: 4, justified: 2, unjustified: 2, unjustifiedPct: 5 });
    });

    it('cuenta las pendientes y las rechazadas', () => {
      const summary = summarizeAttendance([record(false, 'PENDING'), record(false, 'REJECTED'), record(true)]);
      expect(summary.unjustified).toBe(2);
    });

    it('devuelve ceros sin clases registradas', () => {
      expect(summarizeAttendance([]).unjustifiedPct).toBe(0);
    });
  });

  describe('evaluateAttendance', () => {
    it('está bien bajo el primer aviso', () => {
      expect(evaluateAttendance(rule, summarizeAttendance(records(1, 40))).status).toBe('OK');
    });

    it('avisa al llegar a un umbral configurado', () => {
      const result = evaluateAttendance(rule, summarizeAttendance(records(2, 40)));
      expect(result.status).toBe('WARNING');
      expect(result.reachedWarningPct).toBe(5);
    });

    it('excede solo al superar el máximo', () => {
      expect(evaluateAttendance(rule, summarizeAttendance(records(4, 40))).status).toBe('WARNING'); // 10 %
      expect(evaluateAttendance(rule, summarizeAttendance(records(5, 40))).status).toBe('EXCEEDED'); // 12.5 %
    });

    it('aprobar justificaciones baja el estado', () => {
      expect(evaluateAttendance(rule, summarizeAttendance(records(5, 40, 5))).status).toBe('OK');
    });

    it('no evalúa donde la regla no aplica', () => {
      expect(evaluateAttendance(rule, summarizeAttendance(records(10, 40)), false).status).toBe('OK');
    });

    it('usa los valores configurados, no los de la norma', () => {
      const strict = { ...rule, maxUnjustifiedPct: 5, warningPcts: [] };
      expect(evaluateAttendance(strict, summarizeAttendance(records(3, 40))).status).toBe('EXCEEDED');
    });
  });

  it('ruleApplies compara con el orden del nivel', () => {
    expect(ruleApplies(rule, 1)).toBe(false);
    expect(ruleApplies(rule, 2)).toBe(true);
  });

  it('isWorse ordena los estados', () => {
    expect(isWorse('EXCEEDED', 'WARNING')).toBe(true);
    expect(isWorse('OK', 'WARNING')).toBe(false);
    expect(isWorse('WARNING', 'WARNING')).toBe(false);
  });

  describe('plazo de justificación', () => {
    it('calcula días calendario', () => {
      expect(daysBetween('2026-10-01', '2026-10-04')).toBe(3);
    });

    it('acepta dentro del plazo y rechaza fuera de él', () => {
      expect(isWithinJustificationWindow('2026-10-01', '2026-10-04', 3)).toBe(true);
      expect(isWithinJustificationWindow('2026-10-01', '2026-10-05', 3)).toBe(false);
      expect(isWithinJustificationWindow('2026-10-05', '2026-10-01', 3)).toBe(false);
    });

    it('sin plazo configurado siempre acepta', () => {
      expect(isWithinJustificationWindow('2026-01-01', '2026-10-01', null)).toBe(true);
    });
  });
});
