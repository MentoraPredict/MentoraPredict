import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { SubjectReferenceOrmEntity } from './subject-reference.orm-entity';
import { PeriodReferenceOrmEntity } from './period-reference.orm-entity';

@Entity('prediction_logs')
@Index('idx_prediction_logs_student_subject_created', ['studentId', 'subjectId', 'createdAt'])
export class PredictionLogOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;

  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;

  @Column({ name: 'subject_id', type: 'uuid', nullable: true }) subjectId!: string | null;

  @Column({ type: 'jsonb' }) risk!: Record<string, unknown>;

  @Column({ type: 'text' }) summary!: string;

  @Column({ type: 'jsonb' }) recommendations!: Record<string, unknown>[];

  @Column({ name: 'model_version', type: 'varchar', length: 50 }) modelVersion!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }) createdAt!: Date;

  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_prediction_logs_student_id' })
  student?: UserReferenceOrmEntity;

  @ManyToOne(() => SubjectReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_prediction_logs_subject_id' })
  subject?: SubjectReferenceOrmEntity;

  @ManyToOne(() => PeriodReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_prediction_logs_period_id' })
  period?: PeriodReferenceOrmEntity;
}
