import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CareerOrmEntity } from './career.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity("subjects")
export class SubjectOrmEntity {
  @PrimaryColumn("uuid") id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column() credits!: number;
  @Column({ name: "career_id", type: "uuid" }) careerId!: string;
  @ManyToOne(() => CareerOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'career_id', foreignKeyConstraintName: 'FK_subjects_career_id' })
  career?: CareerOrmEntity;
  @Column({ name: "academic_period_id", type: "uuid" })
  academicPeriodId!: string;
  @ManyToOne(() => AcademicPeriodOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academic_period_id', foreignKeyConstraintName: 'FK_subjects_academic_period_id' })
  academicPeriod?: AcademicPeriodOrmEntity;
  @Column({ name: "max_capacity", type: "int", default: 30 })
  maxCapacity!: number;
  @Column({ name: "teacher_id", type: "uuid", nullable: true }) teacherId!:
    | string
    | null;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'teacher_id', foreignKeyConstraintName: 'FK_subjects_teacher_id' })
  teacher?: UserReferenceOrmEntity | null;
  @Column({ name: "is_active", default: true }) isActive!: boolean;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
  @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;
}
