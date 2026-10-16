import {
  Entity,
  PrimaryColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Index('uq_one_active_period', ['status'], { unique: true, where: "status = 'ACTIVE'" })
@Entity('academic_periods')
@Check('CHK_academic_periods_status', `"status" IN ('PLANNED','ACTIVE','FINISHED','CANCELLED')`)
@Check('CHK_academic_periods_type', `"type" IN ('SEMESTER','QUARTER','TRIMESTER','QUIMESTER')`)
export class AcademicPeriodOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 100, unique: true }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ name: 'start_date', type: 'date' }) startDate!: Date;
  @Column({ name: 'end_date', type: 'date' }) endDate!: Date;
  @Column({ length: 20, default: 'PLANNED' }) status!: string;
  @Column({ type: 'varchar', default: 'SEMESTER' }) type!: string;
  @Column({ name: 'school_year_id', type: 'uuid', nullable: true }) schoolYearId!: string | null;
  @Column({ name: 'period_number', type: 'int', nullable: true }) number!: number | null;
  @Column({ name: 'grades_due_date', type: 'date', nullable: true }) gradesDueDate!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
