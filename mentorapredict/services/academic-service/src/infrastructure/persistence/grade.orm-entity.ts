import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('grades')
export class GradeOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'evaluation_id', type: 'uuid' }) evaluationId!: string;
  @Column({ type: 'decimal', precision: 4, scale: 2 }) value!: number;
  @Column({ name: 'recorded_by', type: 'uuid' }) recordedBy!: string;
  @Column({ name: 'recorded_at', type: 'timestamptz' }) recordedAt!: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
