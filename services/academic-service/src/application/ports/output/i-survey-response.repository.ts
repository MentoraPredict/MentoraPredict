import { SurveyResponseEntity } from '../../../domain/entities/survey-response.entity';

export interface ISurveyResponseRepository {
  save(response: SurveyResponseEntity): Promise<SurveyResponseEntity>;
  findByStudentId(studentId: string): Promise<SurveyResponseEntity[]>;
}
