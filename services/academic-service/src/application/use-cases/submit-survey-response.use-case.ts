import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
import { ISurveyResponseRepository } from '../ports/output/i-survey-response.repository';
import { ISurveyQuestionRepository } from '../ports/output/i-survey-question.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IUserProfilePort } from '../ports/output/i-user-profile.port';
import { SubmitSurveyResponseDto } from '../dtos/submit-survey-response.dto';

@Injectable()
export class SubmitSurveyResponseUseCase {
  constructor(
    @Inject('ISurveyResponseRepository') private readonly responseRepo: ISurveyResponseRepository,
    @Inject('ISurveyQuestionRepository') private readonly questionRepo: ISurveyQuestionRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IUserProfilePort') private readonly userProfilePort: IUserProfilePort,
  ) {}

  async execute(studentId: string, dto: SubmitSurveyResponseDto): Promise<SurveyResponseEntity> {
    const period = await this.periodRepo.findById(dto.periodId);
    if (!period) {
      throw new NotFoundException(`Academic period '${dto.periodId}' not found`);
    }

    const validQuestions = await this.questionRepo.findActiveByCategory(dto.surveyCode);
    const validQuestionIds = new Set(validQuestions.map((q) => q.id));
    const unknownAnswer = dto.answers.find((a) => !validQuestionIds.has(a.questionId));
    if (unknownAnswer) {
      throw new BadRequestException(
        `La pregunta '${unknownAnswer.questionId}' no pertenece a la encuesta '${dto.surveyCode}' o no está activa.`,
      );
    }

    // Garantiza que academic_user_references tenga a este estudiante antes
    // del insert (FK real) — mismo patrón de sync-on-fetch que el resto del
    // proyecto, ver docs/database/entity-relationship-diagram.md §3.
    const profile = await this.userProfilePort.getProfile(studentId);
    if (!profile) {
      throw new ServiceUnavailableException('No se pudo verificar tu perfil de usuario. Intenta de nuevo.');
    }

    const response = new SurveyResponseEntity(
      randomUUID(),
      studentId,
      dto.periodId,
      dto.surveyCode,
      new Date(),
      dto.answers.map((a) => ({ questionId: a.questionId, answerValue: a.answerValue })),
    );

    return this.responseRepo.save(response);
  }
}
