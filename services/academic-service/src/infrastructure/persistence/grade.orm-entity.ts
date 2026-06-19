import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("grades")
export class GradeOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column({ name: "student_id", type: "uuid" }) studentId!: string;
  @Column({ name: "subject_id", type: "uuid" }) subjectId!: string;
  @Column({ name: "evaluation_id", type: "uuid", nullable: true })
  evaluationId!: string | null;
  @Column({ type: "decimal", precision: 4, scale: 2 }) value!: number;
  @Column({ name: "registered_by", type: "uuid" }) registeredBy!: string;
  @Column({ name: "registered_at", type: "timestamptz" }) registeredAt!: Date;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
