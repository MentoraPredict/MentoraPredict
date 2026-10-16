import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('grade_levels')
export class GradeLevelOrmEntity {
  @PrimaryColumn({ length: 30 }) code!: string;
  @Column({ name: 'level_code', length: 30 }) levelCode!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ type: 'int' }) ordinal!: number;
  @Column({ name: 'sort_order', type: 'int' }) sortOrder!: number;
}

@Index('idx_sections_year_grade', ['schoolYearId', 'gradeLevelCode'])
@Unique('UQ_sections_year_grade_name', ['schoolYearId', 'gradeLevelCode', 'name'])
@Check('CHK_sections_shift', `"shift" IN ('MATUTINA','VESPERTINA','NOCTURNA')`)
@Check('CHK_sections_capacity', `"capacity" > 0`)
@Entity('sections')
export class SectionOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'school_year_id', type: 'uuid' }) schoolYearId!: string;
  @Column({ name: 'grade_level_code', length: 30 }) gradeLevelCode!: string;
  @Column({ length: 10 }) name!: string;
  @Column({ length: 20 }) shift!: string;
  @Column({ type: 'int' }) capacity!: number;
  @Column({ name: 'tutor_id', type: 'uuid', nullable: true }) tutorId!: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Check('CHK_curriculum_hours', `"weekly_hours" BETWEEN 1 AND 40`)
@Entity('curriculum_subjects')
export class CurriculumSubjectOrmEntity {
  @PrimaryColumn({ name: 'grade_level_code', length: 30 }) gradeLevelCode!: string;
  @PrimaryColumn({ name: 'subject_catalog_id', type: 'uuid' }) subjectCatalogId!: string;
  @Column({ name: 'weekly_hours', type: 'int' }) weeklyHours!: number;
}
