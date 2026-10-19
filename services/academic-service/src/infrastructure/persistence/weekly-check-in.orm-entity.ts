import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { SubjectOrmEntity } from './subject.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity("weekly_check_ins")
@Index(
  "uq_check_in_student_subject_week",
  ["studentId", "subjectId", "academicWeek", "academicYear"],
  { unique: true },
)
@Check('CHK_weekly_check_ins_emotional_state', `"emotional_state" IN ('GREAT','GOOD','NEUTRAL','BAD','CRITICAL')`)
export class WeeklyCheckInOrmEntity {
  @PrimaryColumn("uuid") id!: string;

  @Column({ name: "student_id", type: "uuid" }) studentId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_weekly_check_ins_student_id' })
  student?: UserReferenceOrmEntity;

  @Column({ name: "subject_id", type: "uuid" }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_weekly_check_ins_subject_id' })
  subject?: SubjectOrmEntity;

  @Column({ name: "period_id", type: "uuid" }) periodId!: string;
  @ManyToOne(() => AcademicPeriodOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_weekly_check_ins_period_id' })
  period?: AcademicPeriodOrmEntity;

  @Column({ name: "academic_week", type: "int" }) academicWeek!: number;

  @Column({ name: "academic_year", type: "int" }) academicYear!: number;

  @Column({ name: "check_in_date", type: "date" }) checkInDate!: Date;

  @Column({ type: "int", default: 0 }) attendance!: number;

  @Column({ name: "task_completion", type: "int" }) taskCompletion!: number;

  @Column({ name: "study_hours", type: "decimal", precision: 5, scale: 2 })
  studyHours!: number;

  @Column({ name: "emotional_state", type: "varchar", length: 20 })
  emotionalState!: string;

  @Column({ name: "general_comprehension", type: "int" })
  generalComprehension!: number;

  @Column({ type: "text", nullable: true }) notes!: string | null;
  @Column({ name: "explain_better", type: "text", nullable: true }) explainBetter!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
