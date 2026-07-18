import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { PeriodReferenceOrmEntity } from './period-reference.orm-entity';

@Entity('student_metrics')
export class StudentMetricsOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @Column({ name: 'subject_averages', type: 'jsonb', default: {} }) subjectAverages!: Record<string, number>;
  @Column({ name: 'global_average', type: 'decimal', precision: 5, scale: 2 }) globalAverage!: number;
  @Column({ name: 'calculated_at', type: 'timestamptz' }) calculatedAt!: Date;
  @Column({ type: 'int', default: 1 }) version!: number;

  /**
   * Read-only navigable relations onto the same columns as studentId/periodId
   * above — those remain the sole write path. Physical FK constraints live in
   * migration AddPhysicalForeignKeys, not here.
   */
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_student_metrics_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_student_metrics_period_id' })
  period?: PeriodReferenceOrmEntity;
}
