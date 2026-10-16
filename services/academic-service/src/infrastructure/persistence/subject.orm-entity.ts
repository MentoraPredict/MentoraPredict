import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { SubjectCatalogOrmEntity } from './subject-catalog.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';

@Entity("subjects")
@Unique('UQ_subjects_catalog_period', ['subjectCatalogId', 'academicPeriodId'])
export class SubjectOrmEntity {
  @PrimaryColumn("uuid") id!: string;

  @Column({ name: "subject_catalog_id", type: "uuid" }) subjectCatalogId!: string;
  @ManyToOne(() => SubjectCatalogOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subject_catalog_id', foreignKeyConstraintName: 'FK_subjects_subject_catalog_id' })
  subjectCatalog?: SubjectCatalogOrmEntity;

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
