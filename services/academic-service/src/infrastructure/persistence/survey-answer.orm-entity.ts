import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SurveyResponseOrmEntity } from './survey-response.orm-entity';
import { SurveyQuestionOrmEntity } from './survey-question.orm-entity';

@Entity('survey_answers')
@Unique('UQ_survey_answers_response_question', ['responseId', 'questionId'])
export class SurveyAnswerOrmEntity {
  @PrimaryColumn('uuid') id!: string;

  @Column({ name: 'response_id', type: 'uuid' }) responseId!: string;
  @ManyToOne(() => SurveyResponseOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'response_id', foreignKeyConstraintName: 'FK_survey_answers_response_id' })
  response?: SurveyResponseOrmEntity;

  @Column({ name: 'question_id', type: 'uuid' }) questionId!: string;
  @ManyToOne(() => SurveyQuestionOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'question_id', foreignKeyConstraintName: 'FK_survey_answers_question_id' })
  question?: SurveyQuestionOrmEntity;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsonb column, holds string/number/boolean/array depending on question_type; TypeORM's insert() typing can't reconcile `unknown`.
  @Column({ name: 'answer_value', type: 'jsonb' }) answerValue!: any;
}
