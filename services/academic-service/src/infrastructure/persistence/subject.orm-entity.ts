import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("subjects")
export class SubjectOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column() credits!: number;
  @Column({ name: "career_id", type: "uuid" }) careerId!: string;
  @Column({ name: "academic_period_id", type: "uuid" })
  academicPeriodId!: string;
  @Column({ name: "max_capacity", type: "int", default: 30 })
  maxCapacity!: number;
  @Column({ name: "teacher_id", type: "uuid", nullable: true }) teacherId!:
    | string
    | null;
  @Column({ name: "is_active", default: true }) isActive!: boolean;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
