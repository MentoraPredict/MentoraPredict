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

const DAY_VALUES = `('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')`;

/**
 * Franja horaria semanal de una oferta — una materia puede tener varias
 * (ej. lunes y miércoles a distinta hora). Cambia cada semestre porque cada
 * semestre crea una oferta (subjects) nueva con su propio horario.
 */
@Entity('class_schedules')
@Unique('UQ_class_schedules_subject_day', ['subjectId', 'dayOfWeek'])
@Check('CHK_class_schedules_day_of_week', `"day_of_week" IN ${DAY_VALUES}`)
@Check('CHK_class_schedules_time_range', `"end_time" > "start_time"`)
export class ClassScheduleOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'subject_id', type: 'uuid' }) subjectId!: string;
  @ManyToOne(() => SubjectOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id', foreignKeyConstraintName: 'FK_class_schedules_subject_id' })
  subject?: SubjectOrmEntity;

  @Column({ name: 'day_of_week', length: 10 }) dayOfWeek!: string;
  @Column({ name: 'start_time', type: 'time' }) startTime!: string;
  @Column({ name: 'end_time', type: 'time' }) endTime!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
