import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SubjectOrmEntity } from './subject.orm-entity';

@Entity('evaluations')
export class EvaluationOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) weight!: number;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_evaluations_subject_id' })
  subject?: SubjectOrmEntity;
  @Column({ name: 'due_date', type: 'timestamptz', nullable: true }) dueDate!: Date | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
