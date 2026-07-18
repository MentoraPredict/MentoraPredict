export interface SurveyAnswerValue {
  questionId: string;
  answerValue: unknown;
}

// Una instancia de envío de una encuesta — deliberadamente repetible: un
// estudiante puede responder la misma encuesta más de una vez, incluso
// dentro del mismo período (Fase D, docs/database/database-update-plan.md
// §5.4) — MentoraPredict va entendiendo su situación de forma progresiva,
// no la captura una sola vez.
export class SurveyResponseEntity {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly periodId: string,
    public readonly surveyCode: string,
    public readonly submittedAt: Date,
    public readonly answers: SurveyAnswerValue[],
  ) {}
}
