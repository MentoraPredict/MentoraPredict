export type AlertStatus = 'UNREAD' | 'READ' | 'ACTIVE' | 'RESOLVED';
export type AlertType =
  | 'RISK_HIGH'
  | 'RISK_CRITICAL'
  | 'AVERAGE_DROP'
  | 'FAILED_EVALUATIONS'
  | 'LOW_ATTENDANCE'
  | 'RISK_ESCALATION';
export type AlertSeverity = 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class AlertEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly type: AlertType,
    public message: string,
    public status: AlertStatus,
    public readonly createdAt: Date,
    public metadata: Record<string, unknown>,
    // Fase 7 — only populated for automatic per-subject risk-escalation alerts
    // (RISK_ESCALATION). Legacy RF-021 manual alerts (GenerateAlertsUseCase)
    // leave these null and keep using UNREAD/READ instead of ACTIVE/RESOLVED.
    public readonly subjectId: string | null = null,
    public readonly periodId: string | null = null,
    public severity: AlertSeverity | null = null,
    public triggeredAt: Date | null = null,
    public resolvedAt: Date | null = null,
    public resolvedBy: string | null = null,
  ) {}

  markRead(): void {
    this.status = 'READ';
  }

  // Re-triggers this alert on a fresh risk escalation — same alert row,
  // no duplicate history (at most one ACTIVE alert per student+subject).
  escalate(severity: AlertSeverity, reason: string, triggeredAt: Date): void {
    this.status = 'ACTIVE';
    this.severity = severity;
    this.message = reason;
    this.triggeredAt = triggeredAt;
    this.resolvedAt = null;
    this.resolvedBy = null;
  }

  resolve(resolvedBy: string, resolvedAt: Date = new Date()): void {
    this.status = 'RESOLVED';
    this.resolvedAt = resolvedAt;
    this.resolvedBy = resolvedBy;
  }
}
