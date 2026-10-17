import { Check, Column, Entity, Index, PrimaryColumn, Unique } from 'typeorm';

@Entity('absence_justifications')
@Unique('UQ_absence_justifications_session_student', ['sessionId', 'studentId'])
@Index('idx_absence_justifications_status', ['status', 'createdAt'])
@Check('CHK_absence_justifications_status', `"status" IN ('PENDING','APPROVED','REJECTED')`)
export class AbsenceJustificationOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'session_id', type: 'uuid' }) sessionId!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'requested_by', type: 'uuid' }) requestedBy!: string;
  @Column({ type: 'text' }) reason!: string;
  @Column({ type: 'varchar', length: 10, default: 'PENDING' }) status!: string;
  @Column({ name: 'resolved_by', type: 'uuid', nullable: true }) resolvedBy!: string | null;
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true }) resolvedAt!: Date | null;
  @Column({ name: 'resolution_note', type: 'text', nullable: true }) resolutionNote!: string | null;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }) createdAt!: Date;
}
