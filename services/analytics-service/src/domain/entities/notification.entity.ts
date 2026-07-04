export type NotificationRecipientRole = 'STUDENT' | 'TEACHER';
// Open enum — only RISK_ESCALATION is generated today, future event types
// (e.g. ENROLLMENT_CREATED, GRADES_IMPORTED) can extend this later.
export type NotificationType = 'RISK_ESCALATION';
export type NotificationStatus = 'UNREAD' | 'READ';

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly recipientId: string,
    public readonly recipientRole: NotificationRecipientRole,
    public readonly type: NotificationType,
    public readonly relatedAlertId: string,
    public readonly subjectId: string,
    // Always the affected student's id, even on the teacher's copy — so the
    // teacher knows WHICH student the notification is about.
    public readonly studentId: string,
    public readonly periodId: string,
    public readonly title: string,
    public readonly message: string,
    public status: NotificationStatus,
    public readonly createdAt: Date,
    public readAt: Date | null,
  ) {}

  markRead(): void {
    if (this.status === 'READ') return; // idempotent
    this.status = 'READ';
    this.readAt = new Date();
  }
}
