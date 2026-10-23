import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyQuestionEntity, SurveyQuestionType } from '../../domain/entities/survey-question.entity';
import { ISurveyQuestionRepository } from '../../application/ports/output/i-survey-question.repository';
import { SurveyQuestionOrmEntity } from './survey-question.orm-entity';

@Injectable()
export class SurveyQuestionRepository implements ISurveyQuestionRepository {
  constructor(
    @InjectRepository(SurveyQuestionOrmEntity)
    private readonly repo: Repository<SurveyQuestionOrmEntity>,
  ) {}

  async findById(id: string): Promise<SurveyQuestionEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByCode(code: string): Promise<SurveyQuestionEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async findActiveByCategory(category: string): Promise<SurveyQuestionEntity[]> {
    const list = await this.repo.find({
      where: { category, isActive: true },
      order: { order: 'ASC' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async save(q: SurveyQuestionEntity): Promise<SurveyQuestionEntity> {
    const saved = await this.repo.save(this.toOrm(q));
    return this.toDomain(saved);
  }

  private toDomain = (o: SurveyQuestionOrmEntity): SurveyQuestionEntity =>
    new SurveyQuestionEntity(
      o.id,
      o.code,
      o.category,
      o.questionText,
      o.questionType as SurveyQuestionType,
      o.options,
      o.isActive,
      o.order,
    );

  private toOrm(d: SurveyQuestionEntity): SurveyQuestionOrmEntity {
    const o = new SurveyQuestionOrmEntity();
    o.id = d.id;
    o.code = d.code;
    o.category = d.category;
    o.questionText = d.questionText;
    o.questionType = d.questionType;
    o.options = d.options;
    o.isActive = d.isActive;
    o.order = d.order;
    return o;
  }
}
