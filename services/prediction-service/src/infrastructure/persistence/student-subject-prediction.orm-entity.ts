import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from './subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from './period-reference.orm-entity';

@Entity('student_subject_predictions')
@Index(
  'uq_subject_prediction_student_subject_week',
  ['studentId', 'subjectId', 'academicWeek', 'academicYear'],
  { unique: true },
)
@Check('CHK_student_subject_predictions_status', `"status" IN ('COMPUTED','INSUFFICIENT_DATA')`)
@Check(
  'CHK_student_subject_predictions_risk_level',
  `"predicted_risk_level" IS NULL OR "predicted_risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL')`,
)
export class StudentSubjectPredictionOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;

  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;

  @Column({ name: 'academic_week', type: 'int' }) academicWeek!: number;

  @Column({ name: 'academic_year', type: 'int' }) academicYear!: number;

  @Column({ type: 'varchar', length: 30 }) status!: string;

  @Column({ name: 'predicted_risk_level', type: 'varchar', length: 20, nullable: true })
  predictedRiskLevel!: string | null;

  @Column({ name: 'trend_slope', type: 'decimal', precision: 6, scale: 2, nullable: true })
  trendSlope!: number | null;

  @Column({ type: 'text', nullable: true }) recommendation!: string | null;

  @Column({ name: 'computed_at', type: 'timestamptz' }) computedAt!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_student_subject_predictions_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => SubjectReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_student_subject_predictions_subject_id' })
  subject?: SubjectReferenceOrmEntity;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_student_subject_predictions_period_id' })
  period?: PeriodReferenceOrmEntity;
}
