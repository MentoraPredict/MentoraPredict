import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SurveyQuestionEntity, SurveyQuestionType } from '../../domain/entities/survey-question.entity';
import { ISurveyQuestionRepository } from '../ports/output/i-survey-question.repository';
import { CreateSurveyQuestionDto } from '../dtos/create-survey-question.dto';

@Injectable()
export class CreateSurveyQuestionUseCase {
  constructor(
    @Inject('ISurveyQuestionRepository') private readonly repo: ISurveyQuestionRepository,
  ) {}

  async execute(dto: CreateSurveyQuestionDto): Promise<SurveyQuestionEntity> {
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`El código '${dto.code}' ya está en uso por otra pregunta.`);
    }

    return this.repo.save(
      new SurveyQuestionEntity(
        randomUUID(),
        dto.code,
        dto.category,
        dto.questionText,
        dto.questionType as SurveyQuestionType,
        dto.options ?? null,
        true,
        dto.order ?? 0,
      ),
    );
  }
}
