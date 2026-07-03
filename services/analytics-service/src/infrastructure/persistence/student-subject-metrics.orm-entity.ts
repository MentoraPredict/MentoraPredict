import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('student_subject_metrics')
@Index(
  'uq_subject_metrics_student_subject_week',
  ['studentId', 'subjectId', 'academicWeek', 'academicYear'],
  { unique: true },
)
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
}
