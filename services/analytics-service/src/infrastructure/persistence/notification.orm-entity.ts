import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
// Speeds up the "my unread notifications" query, the most common read path.
@Index('idx_notification_recipient_status', ['recipientId', 'status'])
export class NotificationOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'recipient_id', type: 'uuid' }) recipientId!: string;
  @Column({ name: 'recipient_role', type: 'varchar', length: 20 }) recipientRole!: string;
  @Column({ type: 'varchar', length: 30 }) type!: string;
  @Column({ name: 'related_alert_id', type: 'uuid' }) relatedAlertId!: string;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @Column({ length: 200 }) title!: string;
  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'varchar', length: 10, default: 'UNREAD' }) status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true }) readAt!: Date | null;
}
