import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Check, Unique, CreateDateColumn } from "typeorm";
import { SubjectOrmEntity } from './subject.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity("enrollments")
@Check('CHK_enrollments_status', `"status" IN ('ACTIVE','WITHDRAWN','COMPLETED','SUSPENDED')`)
@Unique('UQ_enrollments_student_subject_period', ['studentId', 'subjectId', 'periodId'])
export class EnrollmentOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column({ name: "student_id", type: "uuid" }) studentId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_enrollments_student_id' })
  student?: UserReferenceOrmEntity;
  @Column({ name: "subject_id", type: "uuid" }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_enrollments_subject_id' })
  subject?: SubjectOrmEntity;
  @Column({ name: "period_id", type: "uuid" }) periodId!: string;
  @ManyToOne(() => AcademicPeriodOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_enrollments_period_id' })
  period?: AcademicPeriodOrmEntity;
  @Column({ type: "varchar", default: "ACTIVE" }) status!: string;
  @Column({ name: "enrolled_at", type: "timestamptz" }) enrolledAt!: Date;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
