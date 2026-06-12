import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('grade_history')
export class GradeHistoryOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'grade_id', type: 'uuid' }) gradeId!: string;
  @Column({ name: 'previous_value', type: 'decimal', precision: 4, scale: 2 }) previousValue!: number;
  @Column({ name: 'new_value', type: 'decimal', precision: 4, scale: 2 }) newValue!: number;
  @Column({ name: 'changed_by', type: 'uuid' }) changedBy!: string;
  @Column({ name: 'changed_at', type: 'timestamptz' }) changedAt!: Date;
}
