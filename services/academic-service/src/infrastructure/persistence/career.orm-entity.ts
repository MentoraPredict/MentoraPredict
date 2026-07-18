import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FacultyOrmEntity } from './faculty.orm-entity';

@Entity('careers')
@Check('CHK_careers_status', `"status" IN ('ACTIVE','INACTIVE')`)
export class CareerOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 200 }) name!: string;
  @Column({ length: 20, unique: true }) code!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ length: 20, default: 'ACTIVE' }) status!: string;
  @Column({ name: 'faculty_id', type: 'uuid' }) facultyId!: string;
  @Column({ name: 'duration_semesters', type: 'int' }) durationSemesters!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  /**
   * Read-only navigable relation onto the same `faculty_id` column as
   * `facultyId` above — `facultyId` remains the sole write path (existing
   * repositories/use cases are unaffected). Physical FK constraint lives in
   * migration 1784323839387-AddPhysicalForeignKeys.ts, not here.
   */
  @ManyToOne(() => FacultyOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'faculty_id', foreignKeyConstraintName: 'FK_careers_faculty_id' })
  faculty?: FacultyOrmEntity;
}
