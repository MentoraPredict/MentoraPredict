import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("weekly_check_ins")
@Index(
  "uq_check_in_student_subject_week",
  ["studentId", "subjectId", "academicWeek", "academicYear"],
  { unique: true },
)
export class WeeklyCheckInOrmEntity {
  @PrimaryColumn("uuid") id!: string;

  @Column({ name: "student_id", type: "uuid" }) studentId!: string;

  @Column({ name: "subject_id", type: "uuid" }) subjectId!: string;

  @Column({ name: "period_id", type: "uuid" }) periodId!: string;

  @Column({ name: "academic_week", type: "int" }) academicWeek!: number;

  @Column({ name: "academic_year", type: "int" }) academicYear!: number;

  @Column({ name: "check_in_date", type: "date" }) checkInDate!: Date;

  @Column({ type: "boolean" }) attendance!: boolean;

  @Column({ name: "task_completion", type: "int" }) taskCompletion!: number;

  @Column({ name: "study_hours", type: "decimal", precision: 5, scale: 2 })
  studyHours!: number;

  @Column({ name: "emotional_state", type: "varchar", length: 20 })
  emotionalState!: string;

  @Column({ name: "general_comprehension", type: "int" })
  generalComprehension!: number;

  @Column({ name: "topic_responses", type: "jsonb", default: "[]" })
  topicResponses!: Record<string, unknown>[];

  @Column({ type: "text", nullable: true }) notes!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
