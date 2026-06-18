import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('evaluations')
export class EvaluationOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) weight!: number;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @Column({ name: 'due_date', type: 'timestamptz', nullable: true }) dueDate!: Date | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
