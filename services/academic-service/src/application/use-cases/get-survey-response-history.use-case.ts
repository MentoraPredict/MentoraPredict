import { Inject, Injectable } from '@nestjs/common';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
import { ISurveyResponseRepository } from '../ports/output/i-survey-response.repository';

@Injectable()
export class GetSurveyResponseHistoryUseCase {
  constructor(
    @Inject('ISurveyResponseRepository') private readonly repo: ISurveyResponseRepository,
  ) {}

  async execute(studentId: string): Promise<SurveyResponseEntity[]> {
    return this.repo.findByStudentId(studentId);
  }
}
