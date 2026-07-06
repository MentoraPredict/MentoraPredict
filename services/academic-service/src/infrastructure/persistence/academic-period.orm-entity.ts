import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Index('uq_one_active_period', ['status'], { unique: true, where: "status = 'ACTIVE'" })
@Entity('academic_periods')
export class AcademicPeriodOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 100, unique: true }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ name: 'start_date', type: 'date' }) startDate!: Date;
  @Column({ name: 'end_date', type: 'date' }) endDate!: Date;
  @Column({ length: 20, default: 'PLANNED' }) status!: string;
  @Column({ type: 'varchar', default: 'SEMESTER' }) type!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
