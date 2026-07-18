import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GradeOrmEntity } from './grade.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity('grade_history')
export class GradeHistoryOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'grade_id', type: 'uuid' }) gradeId!: string;
  @ManyToOne(() => GradeOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grade_id', foreignKeyConstraintName: 'FK_grade_history_grade_id' })
  grade?: GradeOrmEntity;
  @Column({ name: 'previous_value', type: 'decimal', precision: 4, scale: 2 }) previousValue!: number;
  @Column({ name: 'new_value', type: 'decimal', precision: 4, scale: 2 }) newValue!: number;
  @Column({ name: 'changed_by', type: 'uuid' }) changedBy!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changed_by', foreignKeyConstraintName: 'FK_grade_history_changed_by' })
  changedByUser?: UserReferenceOrmEntity;
  @Column({ name: 'changed_at', type: 'timestamptz' }) changedAt!: Date;
}
