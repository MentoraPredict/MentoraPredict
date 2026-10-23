export type SurveyQuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'NUMBER' | 'TEXT' | 'BOOLEAN';

// Catálogo de preguntas de encuesta — expandible sin migraciones (Fase D,
// docs/database/database-update-plan.md §5.4). `category` distingue
// SOCIOECONOMIC de encuestas futuras que reutilicen este mismo motor.
export class SurveyQuestionEntity {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly category: string,
    public questionText: string,
    public questionType: SurveyQuestionType,
    public options: string[] | null,
    public isActive: boolean,
    public order: number,
  ) {}
}
