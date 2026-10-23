import { Inject, Injectable } from '@nestjs/common';
import { SurveyQuestionEntity } from '../../domain/entities/survey-question.entity';
import { ISurveyQuestionRepository } from '../ports/output/i-survey-question.repository';

@Injectable()
export class ListSurveyQuestionsUseCase {
  constructor(
    @Inject('ISurveyQuestionRepository') private readonly repo: ISurveyQuestionRepository,
  ) {}

  async execute(surveyCode: string): Promise<SurveyQuestionEntity[]> {
    return this.repo.findActiveByCategory(surveyCode);
  }
}
