import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from './subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from './period-reference.orm-entity';

@Entity('student_subject_metrics')
@Index(
  'uq_subject_metrics_student_subject_week',
  ['studentId', 'subjectId', 'academicWeek', 'academicYear'],
  { unique: true },
)
@Check('CHK_student_subject_metrics_risk_level', `"risk_level" IS NULL OR "risk_level" IN ('LOW','MEDIUM','HIGH','CRITICAL')`)
export class StudentSubjectMetricsOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;

  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;

  @Column({ name: 'academic_week', type: 'int' }) academicWeek!: number;

  @Column({ name: 'academic_year', type: 'int' }) academicYear!: number;

  @Column({ name: 'average_grade', type: 'decimal', precision: 4, scale: 2, nullable: true })
  averageGrade!: number | null;

  @Column({ name: 'compliance_index', type: 'int', nullable: true })
  complianceIndex!: number | null;

  @Column({ name: 'attendance_rate', type: 'int', nullable: true })
  attendanceRate!: number | null;

  @Column({ name: 'study_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  studyHours!: number | null;

  @Column({ name: 'comprehension_avg', type: 'int', nullable: true })
  comprehensionAvg!: number | null;

  @Column({ name: 'risk_level', type: 'varchar', length: 20, nullable: true })
  riskLevel!: string | null;

  @Column({ name: 'trend_slope', type: 'decimal', precision: 6, scale: 2, nullable: true })
  trendSlope!: number | null;

  @Column({ name: 'computed_at', type: 'timestamptz' }) computedAt!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_student_subject_metrics_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => SubjectReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_student_subject_metrics_subject_id' })
  subject?: SubjectReferenceOrmEntity;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_student_subject_metrics_period_id' })
  period?: PeriodReferenceOrmEntity;
}
