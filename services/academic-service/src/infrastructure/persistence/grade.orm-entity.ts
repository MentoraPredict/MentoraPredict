import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { SubjectOrmEntity } from './subject.orm-entity';
import { EvaluationOrmEntity } from './evaluation.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity("grades")
export class GradeOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column({ name: "student_id", type: "uuid" }) studentId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_grades_student_id' })
  student?: UserReferenceOrmEntity;
  @Column({ name: "subject_id", type: "uuid" }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_grades_subject_id' })
  subject?: SubjectOrmEntity;
  @Column({ name: "evaluation_id", type: "uuid", nullable: true })
  evaluationId!: string | null;
  @ManyToOne(() => EvaluationOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'evaluation_id', foreignKeyConstraintName: 'FK_grades_evaluation_id' })
  evaluation?: EvaluationOrmEntity | null;
  @Column({ type: "decimal", precision: 4, scale: 2 }) value!: number;
  @Column({ name: "registered_by", type: "uuid" }) registeredBy!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'registered_by', foreignKeyConstraintName: 'FK_grades_registered_by' })
  registeredByUser?: UserReferenceOrmEntity;
  @Column({ name: "registered_at", type: "timestamptz" }) registeredAt!: Date;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
