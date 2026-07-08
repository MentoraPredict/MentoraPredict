export type NotificationRecipientRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
// Open enum — extend as new notification-worthy events are wired up.
export type NotificationType =
  | 'RISK_ESCALATION'
  | 'ENROLLMENT_CREATED'
  | 'COURSE_CREATED';
export type NotificationStatus = 'UNREAD' | 'READ';

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly recipientId: string,
    public readonly recipientRole: NotificationRecipientRole,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public status: NotificationStatus,
    public readonly createdAt: Date,
    public readAt: Date | null,
    // Risk-escalation-specific context — null for other notification types.
    public readonly relatedAlertId: string | null = null,
    public readonly subjectId: string | null = null,
    // Always the affected student's id, even on the teacher's copy — so the
    // teacher knows WHICH student the notification is about.
    public readonly studentId: string | null = null,
    public readonly periodId: string | null = null,
  ) {}

  markRead(): void {
    if (this.status === 'READ') return; // idempotent
    this.status = 'READ';
    this.readAt = new Date();
  }
}
