import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from '../../../infrastructure/persistence/user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from '../../../infrastructure/persistence/subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from '../../../infrastructure/persistence/period-reference.orm-entity';
import { AlertOrmEntity } from '../../../infrastructure/persistence/alert.orm-entity';

@Entity('notifications')
// Speeds up the "my unread notifications" query, the most common read path.
@Index('idx_notification_recipient_status', ['recipientId', 'status'])
// Open enum (new notification-worthy events get added over time) — the CHECK
// still requires a matching migration whenever a new type is introduced,
// same discipline already applied to every other status column in this plan.
@Check('CHK_notifications_type', `"type" IN ('RISK_ESCALATION','ENROLLMENT_CREATED','ENROLLMENT_WITHDRAWN','COURSE_CREATED','ROLE_CHANGED')`)
@Check('CHK_notifications_recipient_role', `"recipient_role" IN ('STUDENT','TEACHER','ADMIN')`)
@Check('CHK_notifications_status', `"status" IN ('UNREAD','READ')`)
export class NotificationOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'recipient_id', type: 'uuid' }) recipientId!: string;
  @Column({ name: 'recipient_role', type: 'varchar', length: 20 }) recipientRole!: string;
  @Column({ type: 'varchar', length: 30 }) type!: string;
  @Column({ name: 'related_alert_id', type: 'uuid', nullable: true }) relatedAlertId!: string | null;
  @Column({ name: 'subject_id', type: 'uuid', nullable: true }) subjectId!: string | null;
  @Column({ name: 'student_id', type: 'uuid', nullable: true }) studentId!: string | null;
  @Column({ name: 'period_id', type: 'uuid', nullable: true }) periodId!: string | null;
  @Column({ length: 200 }) title!: string;
  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'varchar', length: 10, default: 'UNREAD' }) status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true }) readAt!: Date | null;

  @ManyToOne(() => AlertOrmEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_alert_id', foreignKeyConstraintName: 'FK_notifications_related_alert_id' })
  relatedAlert?: AlertOrmEntity | null;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipient_id', foreignKeyConstraintName: 'FK_notifications_recipient_id' })
  recipient?: UserReferenceOrmEntity;

  @ManyToOne(() => SubjectReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_notifications_subject_id' })
  subject?: SubjectReferenceOrmEntity | null;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_notifications_student_id' })
  student?: UserReferenceOrmEntity | null;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_notifications_period_id' })
  period?: PeriodReferenceOrmEntity | null;
}
