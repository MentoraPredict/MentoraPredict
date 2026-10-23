import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from './subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from './period-reference.orm-entity';

@Entity('alerts')
// At most one ACTIVE alert per (student, subject) — legacy manual alerts never
// use status='ACTIVE' so this never constrains them, only Fase 7 escalations.
@Index('uq_active_alert_student_subject', ['studentId', 'subjectId'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
@Check('CHK_alerts_type', `"type" IN ('RISK_HIGH','RISK_CRITICAL','AVERAGE_DROP','FAILED_EVALUATIONS','LOW_ATTENDANCE','RISK_ESCALATION')`)
@Check('CHK_alerts_status', `"status" IN ('UNREAD','READ','ACTIVE','RESOLVED')`)
@Check('CHK_alerts_severity', `"severity" IS NULL OR "severity" IN ('MEDIUM','HIGH','CRITICAL')`)
export class AlertOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ type: 'varchar' }) type!: string;
  @Column({ type: 'text' }) message!: string;
  @Column({ type: 'varchar', default: 'UNREAD' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, unknown>;

  @Column({ name: 'subject_id', type: 'uuid', nullable: true }) subjectId!: string | null;
  @Column({ name: 'period_id', type: 'uuid', nullable: true }) periodId!: string | null;
  @Column({ type: 'varchar', length: 20, nullable: true }) severity!: string | null;
  @Column({ name: 'triggered_at', type: 'timestamptz', nullable: true }) triggeredAt!: Date | null;
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true }) resolvedAt!: Date | null;
  @Column({ name: 'resolved_by', type: 'uuid', nullable: true }) resolvedBy!: string | null;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_alerts_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'resolved_by', foreignKeyConstraintName: 'FK_alerts_resolved_by' })
  resolver?: UserReferenceOrmEntity | null;

  @ManyToOne(() => SubjectReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_alerts_subject_id' })
  subject?: SubjectReferenceOrmEntity | null;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_alerts_period_id' })
  period?: PeriodReferenceOrmEntity | null;
}
