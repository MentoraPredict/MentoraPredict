import {
  Entity,
  PrimaryColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Index('uq_one_active_school_year', ['status'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
@Entity('school_years')
@Check('CHK_school_years_status', `"status" IN ('PLANNED','ACTIVE','FINISHED')`)
@Check('CHK_school_years_regime', `"regime" IN ('SIERRA_AMAZONIA','COSTA_GALAPAGOS')`)
@Check('CHK_school_years_scheme', `"period_scheme" IN ('TRIMESTER','QUIMESTER','SEMESTER')`)
@Check('CHK_school_years_dates', `"start_date" < "end_date"`)
export class SchoolYearOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 100, unique: true }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ length: 20, default: 'SIERRA_AMAZONIA' }) regime!: string;
  @Column({ name: 'period_scheme', length: 20, default: 'TRIMESTER' }) periodScheme!: string;
  @Column({ name: 'periods_count', type: 'int', default: 3 }) periodsCount!: number;
  @Column({ name: 'start_date', type: 'date' }) startDate!: string;
  @Column({ name: 'end_date', type: 'date' }) endDate!: string;
  @Column({ name: 'min_class_days', type: 'int', default: 200 }) minClassDays!: number;
  @Column({ name: 'recovery_start_date', type: 'date', nullable: true }) recoveryStartDate!: string | null;
  @Column({ name: 'recovery_end_date', type: 'date', nullable: true }) recoveryEndDate!: string | null;
  @Column({ name: 'supplementary_start_date', type: 'date', nullable: true }) supplementaryStartDate!: string | null;
  @Column({ name: 'supplementary_end_date', type: 'date', nullable: true }) supplementaryEndDate!: string | null;
  @Column({ length: 20, default: 'PLANNED' }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
