export type AlertStatus = 'UNREAD' | 'READ';
export type AlertType =
  | 'RISK_HIGH'
  | 'RISK_CRITICAL'
  | 'AVERAGE_DROP'
  | 'FAILED_EVALUATIONS'
  | 'LOW_ATTENDANCE';

export class AlertEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly type: AlertType,
    public readonly message: string,
    public status: AlertStatus,
    public readonly createdAt: Date,
    public metadata: Record<string, unknown>,
  ) {}

  markRead(): void {
    this.status = 'READ';
  }
}
