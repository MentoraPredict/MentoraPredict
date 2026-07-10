import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('alerts')
// At most one ACTIVE alert per (student, subject) — legacy manual alerts never
// use status='ACTIVE' so this never constrains them, only Fase 7 escalations.
@Index('uq_active_alert_student_subject', ['studentId', 'subjectId'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
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
}
