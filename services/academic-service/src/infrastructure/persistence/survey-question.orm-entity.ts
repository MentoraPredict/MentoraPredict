import { Entity, PrimaryColumn, Column, Check } from 'typeorm';

const QUESTION_TYPES = `('SINGLE_CHOICE','MULTI_CHOICE','NUMBER','TEXT','BOOLEAN')`;

/**
 * Catálogo de preguntas de encuesta — Fase D
 * (docs/database/database-update-plan.md §5.4). Agregar una pregunta nueva
 * es una fila nueva, no una migración.
 */
@Entity('survey_questions')
@Check('CHK_survey_questions_question_type', `"question_type" IN ${QUESTION_TYPES}`)
export class SurveyQuestionOrmEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ length: 50, unique: true }) code!: string;
  @Column({ length: 50 }) category!: string;
  @Column({ name: 'question_text', type: 'text' }) questionText!: string;
  @Column({ name: 'question_type', length: 20 }) questionType!: string;
  @Column({ type: 'jsonb', nullable: true }) options!: string[] | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @Column({ default: 0 }) order!: number;
}
