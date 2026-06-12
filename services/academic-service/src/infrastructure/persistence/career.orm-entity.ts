import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('careers')
export class CareerOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ name: 'faculty_id', type: 'uuid' }) facultyId!: string;
  @Column({ name: 'duration_semesters', type: 'int' }) durationSemesters!: number;
}
