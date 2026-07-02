import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('student_subject_predictions')
@Index(
  'uq_subject_prediction_student_subject_week',
  ['studentId', 'subjectId', 'academicWeek', 'academicYear'],
  { unique: true },
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
}
