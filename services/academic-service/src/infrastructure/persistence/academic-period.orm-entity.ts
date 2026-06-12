import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('academic_periods')
export class AcademicPeriodOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ name: 'start_date', type: 'date' }) startDate!: Date;
  @Column({ name: 'end_date', type: 'date' }) endDate!: Date;
  @Column({ name: 'is_active', default: false }) isActive!: boolean;
  @Column({ type: 'varchar', default: 'SEMESTER' }) type!: string;
}
