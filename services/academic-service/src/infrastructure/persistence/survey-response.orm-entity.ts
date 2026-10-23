import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserReferenceOrmEntity } from './user-reference.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';

/**
 * Instancia de envío de una encuesta — Fase D
 * (docs/database/database-update-plan.md §5.4). Deliberadamente sin ningún
 * UNIQUE sobre (student_id, period_id): un estudiante puede responder la
 * misma encuesta más de una vez, incluso dentro del mismo período.
 */
@Entity('survey_responses')
export class SurveyResponseOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'student_id', type: 'uuid' }) studentId!: string;
  @ManyToOne(() => UserReferenceOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id', foreignKeyConstraintName: 'FK_survey_responses_student_id' })
  student?: UserReferenceOrmEntity;

  @Column({ name: 'period_id', type: 'uuid' }) periodId!: string;
  @ManyToOne(() => AcademicPeriodOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'period_id', foreignKeyConstraintName: 'FK_survey_responses_period_id' })
  period?: AcademicPeriodOrmEntity;

  @Column({ name: 'survey_code', length: 50 }) surveyCode!: string;
  @Column({ name: 'submitted_at', type: 'timestamptz' }) submittedAt!: Date;
}
