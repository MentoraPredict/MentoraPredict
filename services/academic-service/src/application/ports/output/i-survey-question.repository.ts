import { SurveyQuestionEntity } from '../../../domain/entities/survey-question.entity';

export interface ISurveyQuestionRepository {
  findById(id: string): Promise<SurveyQuestionEntity | null>;
  findByCode(code: string): Promise<SurveyQuestionEntity | null>;
  findActiveByCategory(category: string): Promise<SurveyQuestionEntity[]>;
  save(question: SurveyQuestionEntity): Promise<SurveyQuestionEntity>;
}
