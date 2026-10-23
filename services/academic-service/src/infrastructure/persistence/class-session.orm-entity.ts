import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
} from 'typeorm';
import { SubjectOrmEntity } from './subject.orm-entity';
import { ClassScheduleOrmEntity } from './class-schedule.orm-entity';

/**
 * Ocurrencia concreta de una franja horaria (class_schedule) en una fecha
 * real del período — Fase B (docs/database/database-update-plan.md §5.2).
 * Generada al definir el horario de una oferta, cubriendo start_date/
 * end_date del período de esa oferta.
 */
@Entity('class_sessions')
@Unique('UQ_class_sessions_subject_date', ['subjectId', 'sessionDate'])
@Check('CHK_class_sessions_status', `"status" IN ('PLANNED','HELD','CANCELLED')`)
export class ClassSessionOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_class_sessions_subject_id' })
  subject?: SubjectOrmEntity;

  @Column({ name: 'schedule_id', type: 'uuid' }) scheduleId!: string;
  @ManyToOne(() => ClassScheduleOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'schedule_id', foreignKeyConstraintName: 'FK_class_sessions_schedule_id' })
  schedule?: ClassScheduleOrmEntity;

  @Column({ name: 'session_date', type: 'date' }) sessionDate!: Date;
  @Column({ name: 'academic_week', type: 'int' }) academicWeek!: number;
  @Column({ name: 'academic_year', type: 'int' }) academicYear!: number;
  @Column({ length: 20, default: 'PLANNED' }) status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
