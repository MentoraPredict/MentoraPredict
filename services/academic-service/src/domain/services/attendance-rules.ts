import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
} from '../entities/attendance.entity';
import { AttendanceRule } from '../entities/institution-config.entity';

/**
 * Reglas de asistencia. El límite, los avisos y los días para justificar
 * llegan como datos de la configuración institucional.
 */

const round = (value: number, decimals: number) =>
  Math.round((value + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;

const STATUS_RANK: Record<AttendanceStatus, number> = { OK: 0, WARNING: 1, EXCEEDED: 2 };

export const isWorse = (next: AttendanceStatus, previous: AttendanceStatus): boolean =>
  STATUS_RANK[next] > STATUS_RANK[previous];

/**
 * Resume las clases con asistencia registrada. Una falta cuenta como
 * injustificada hasta que su justificación se aprueba (una pendiente o
 * rechazada sigue contando).
 */
export function summarizeAttendance(records: AttendanceRecord[]): AttendanceSummary {
  const held = records.length;
  const absent = records.filter((r) => !r.present);
  const justified = absent.filter((r) => r.justification === 'APPROVED').length;
  const unjustified = absent.length - justified;

  return {
    held,
    absences: absent.length,
    justified,
    unjustified,
    unjustifiedPct: held === 0 ? 0 : round((unjustified / held) * 100, 2),
  };
}

export interface AttendanceEvaluation {
  status: AttendanceStatus;
  /** Aviso más alto alcanzado, si lo hay. */
  reachedWarningPct: number | null;
  maxPct: number;
  applies: boolean;
}

/** Nivel desde el que aplica la regla, según el orden del catálogo de niveles. */
export function ruleApplies(rule: AttendanceRule, levelSortOrder: number): boolean {
  return levelSortOrder >= rule.appliesFromLevelOrder;
}

export function evaluateAttendance(
  rule: AttendanceRule,
  summary: AttendanceSummary,
  applies = true,
): AttendanceEvaluation {
  const reached = [...rule.warningPcts]
    .sort((a, b) => b - a)
    .find((pct) => summary.unjustifiedPct >= pct);

  let status: AttendanceStatus = 'OK';
  if (applies) {
    if (summary.unjustifiedPct > rule.maxUnjustifiedPct) status = 'EXCEEDED';
    else if (reached !== undefined) status = 'WARNING';
  }

  return {
    status,
    reachedWarningPct: reached ?? null,
    maxPct: rule.maxUnjustifiedPct,
    applies,
  };
}

const toUtcDay = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Días calendario transcurridos entre dos fechas YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcDay(to) - toUtcDay(from)) / (24 * 3600 * 1000));
}

/** null en `days` significa sin plazo. */
export function isWithinJustificationWindow(
  sessionDate: string,
  today: string,
  days: number | null,
): boolean {
  if (days === null) return true;
  const elapsed = daysBetween(sessionDate, today);
  return elapsed >= 0 && elapsed <= days;
}
