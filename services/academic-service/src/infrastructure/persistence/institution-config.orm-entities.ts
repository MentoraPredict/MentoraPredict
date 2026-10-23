import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('institutions')
@Check('CHK_institutions_sustentation', `"sustentation" IN ('FISCAL','FISCOMISIONAL','MUNICIPAL','PARTICULAR')`)
@Check('CHK_institutions_regime', `"regime" IN ('SIERRA_AMAZONIA','COSTA_GALAPAGOS')`)
export class InstitutionOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true }) amie!: string | null;
  @Column({ length: 200 }) name!: string;
  @Column({ length: 20, default: 'FISCAL' }) sustentation!: string;
  @Column({ length: 20, default: 'SIERRA_AMAZONIA' }) regime!: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) zone!: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) district!: string | null;
  @Column({ type: 'varchar', length: 300, nullable: true }) address!: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) phone!: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) email!: string | null;
  @Column({ name: 'rector_name', type: 'varchar', length: 200, nullable: true }) rectorName!: string | null;
  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true }) logoUrl!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('education_levels')
@Check('CHK_education_levels_mode', `"evaluation_mode" IN ('QUALITATIVE','MIXED')`)
export class EducationLevelOrmEntity {
  @PrimaryColumn({ length: 30 }) code!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ name: 'level_group', length: 20 }) levelGroup!: string;
  @Column({ name: 'sort_order', type: 'int' }) sortOrder!: number;
  @Column({ name: 'evaluation_mode', length: 20 }) evaluationMode!: string;
  @Column({ name: 'allows_supplementary', type: 'boolean', default: false }) allowsSupplementary!: boolean;
}

@Entity('institution_levels')
export class InstitutionLevelOrmEntity {
  @PrimaryColumn({ name: 'institution_id', type: 'uuid' }) institutionId!: string;
  @PrimaryColumn({ name: 'level_code', length: 30 }) levelCode!: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @Column({ type: 'jsonb', default: () => `'[]'` }) shifts!: string[];
}

@Index('uq_default_grading_scale', ['institutionId'], { unique: true, where: '"is_default" = true' })
@Entity('grading_scales')
export class GradingScaleOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'institution_id', type: 'uuid' }) institutionId!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ name: 'min_value', type: 'numeric', precision: 5, scale: 2 }) minValue!: string;
  @Column({ name: 'max_value', type: 'numeric', precision: 5, scale: 2 }) maxValue!: string;
  @Column({ name: 'passing_grade', type: 'numeric', precision: 5, scale: 2 }) passingGrade!: string;
  @Column({ type: 'int', default: 2 }) decimals!: number;
  @Column({ name: 'is_default', type: 'boolean', default: true }) isDefault!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('grading_scale_bands')
export class GradingScaleBandOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ name: 'scale_id', type: 'uuid' }) scaleId!: string;
  @Column({ length: 20 }) code!: string;
  @Column({ length: 200 }) label!: string;
  @Column({ name: 'min_value', type: 'numeric', precision: 5, scale: 2 }) minValue!: string;
  @Column({ name: 'max_value', type: 'numeric', precision: 5, scale: 2 }) maxValue!: string;
  @Column({ name: 'sort_order', type: 'int' }) sortOrder!: number;
}

@Entity('attendance_rules')
export class AttendanceRuleOrmEntity {
  @PrimaryColumn({ name: 'institution_id', type: 'uuid' }) institutionId!: string;
  @Column({ name: 'max_unjustified_pct', type: 'numeric', precision: 5, scale: 2 }) maxUnjustifiedPct!: string;
  @Column({ name: 'warning_pcts', type: 'jsonb', default: () => `'[]'` }) warningPcts!: number[];
  @Column({ name: 'applies_from_level_order', type: 'int' }) appliesFromLevelOrder!: number;
  @Column({ name: 'justification_days', type: 'int', nullable: true }) justificationDays!: number | null;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

@Entity('promotion_rules')
@Check('CHK_promotion_rules_policy', `"repetition_policy" IN ('NOT_APPLICABLE','FAMILY_REQUEST','BY_GRADE')`)
export class PromotionRuleOrmEntity {
  @PrimaryColumn({ name: 'institution_id', type: 'uuid' }) institutionId!: string;
  @PrimaryColumn({ name: 'level_code', length: 30 }) levelCode!: string;
  @Column({ name: 'min_average', type: 'numeric', precision: 5, scale: 2 }) minAverage!: string;
  @Column({ name: 'allows_supplementary', type: 'boolean', default: false }) allowsSupplementary!: boolean;
  @Column({ name: 'supplementary_min_average', type: 'numeric', precision: 5, scale: 2, default: 4 }) supplementaryMinAverage!: string;
  @Column({ name: 'repetition_policy', length: 20 }) repetitionPolicy!: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
