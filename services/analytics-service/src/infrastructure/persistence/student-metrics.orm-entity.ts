import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('student_metrics')
export class StudentMetricsOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @Column({ name: 'subject_averages', type: 'jsonb', default: {} }) subjectAverages!: Record<string, number>;
  @Column({ name: 'global_average', type: 'decimal', precision: 5, scale: 2 }) globalAverage!: number;
  @Column({ name: 'calculated_at', type: 'timestamptz' }) calculatedAt!: Date;
  @Column({ type: 'int', default: 1 }) version!: number;
}
