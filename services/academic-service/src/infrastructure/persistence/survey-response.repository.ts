import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { SurveyAnswerValue, SurveyResponseEntity } from '../../domain/entities/survey-response.entity';
import { ISurveyResponseRepository } from '../../application/ports/output/i-survey-response.repository';
import { SurveyResponseOrmEntity } from './survey-response.orm-entity';
import { SurveyAnswerOrmEntity } from './survey-answer.orm-entity';

@Injectable()
export class SurveyResponseRepository implements ISurveyResponseRepository {
  constructor(
    @InjectRepository(SurveyResponseOrmEntity)
    private readonly repo: Repository<SurveyResponseOrmEntity>,
    @InjectRepository(SurveyAnswerOrmEntity)
    private readonly answerRepo: Repository<SurveyAnswerOrmEntity>,
  ) {}

  async save(response: SurveyResponseEntity): Promise<SurveyResponseEntity> {
    await this.repo.manager.transaction(async (manager) => {
      const o = new SurveyResponseOrmEntity();
      o.id = response.id;
      o.studentId = response.studentId;
      o.periodId = response.periodId;
      o.surveyCode = response.surveyCode;
      o.submittedAt = response.submittedAt;
      await manager.save(o);

      await manager.insert(
        SurveyAnswerOrmEntity,
        response.answers.map((a) => {
          const ao = new SurveyAnswerOrmEntity();
          ao.id = randomUUID();
          ao.responseId = response.id;
          ao.questionId = a.questionId;
          ao.answerValue = a.answerValue;
          return ao;
        }),
      );
    });
    return response;
  }

  async findByStudentId(studentId: string): Promise<SurveyResponseEntity[]> {
    const responses = await this.repo.find({
      where: { studentId },
      order: { submittedAt: 'DESC' },
    });
    const answersByResponse = await this.findAnswersBatch(responses.map((r) => r.id));
    return responses.map(
      (r) =>
        new SurveyResponseEntity(
          r.id,
          r.studentId,
          r.periodId,
          r.surveyCode,
          r.submittedAt,
          answersByResponse.get(r.id) ?? [],
        ),
    );
  }

  private async findAnswersBatch(responseIds: string[]): Promise<Map<string, SurveyAnswerValue[]>> {
    const map = new Map<string, SurveyAnswerValue[]>();
    if (responseIds.length === 0) return map;
    const list = await this.answerRepo.find({ where: { responseId: In(responseIds) } });
    for (const a of list) {
      const existing = map.get(a.responseId) ?? [];
      existing.push({ questionId: a.questionId, answerValue: a.answerValue });
      map.set(a.responseId, existing);
    }
    return map;
  }
}
