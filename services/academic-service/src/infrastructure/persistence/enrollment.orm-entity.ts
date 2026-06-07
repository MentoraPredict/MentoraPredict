import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('enrollments')
export class EnrollmentOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @Column({ type: 'varchar', default: 'ACTIVE' }) status!: string;
  @Column({ name: 'enrolled_at', type: 'timestamptz' }) enrolledAt!: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
