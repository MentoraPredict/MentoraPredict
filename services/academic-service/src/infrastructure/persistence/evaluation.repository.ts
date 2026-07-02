import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationEntity } from '../../domain/entities/evaluation.entity';
import { IEvaluationRepository } from '../../application/ports/output/i-evaluation.repository';
import { EvaluationOrmEntity } from './evaluation.orm-entity';

@Injectable()
export class EvaluationRepository implements IEvaluationRepository {
  constructor(@InjectRepository(EvaluationOrmEntity) private readonly repo: Repository<EvaluationOrmEntity>) {}

  async findById(id: string): Promise<EvaluationEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findBySubjectId(subjectId: string): Promise<EvaluationEntity[]> {
    return (await this.repo.find({ where: { subjectId } })).map(this.toDomain);
  }

  async getTotalWeightForSubject(subjectId: string): Promise<number> {
    const res = await this.repo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.weight), 0)', 'total')
      .where('e.subject_id = :subjectId AND e.is_active = true', { subjectId })
      .getRawOne();
    return parseFloat(res.total ?? '0');
  }

  async getTotalWeightExcluding(subjectId: string, excludeId: string): Promise<number> {
    const res = await this.repo
      .createQueryBuilder('e')
      .select('COALESCE(SUM(e.weight), 0)', 'total')
      .where('e.subject_id = :subjectId AND e.is_active = true AND e.id != :excludeId', { subjectId, excludeId })
      .getRawOne();
    return parseFloat(res.total ?? '0');
  }

  async save(e: EvaluationEntity): Promise<EvaluationEntity> {
    const saved = await this.repo.save(this.toOrm(e));
    return this.toDomain(saved);
  }

  async update(e: EvaluationEntity): Promise<EvaluationEntity> {
    const saved = await this.repo.save(this.toOrm(e));
    return this.toDomain(saved);
  }

  private toDomain = (o: EvaluationOrmEntity): EvaluationEntity =>
    new EvaluationEntity(o.id, o.name, Number(o.weight), o.subjectId, o.dueDate, o.isActive, o.createdAt, o.updatedAt);

  private toOrm(d: EvaluationEntity): EvaluationOrmEntity {
    const o = new EvaluationOrmEntity();
    o.id = d.id; o.name = d.name; o.weight = d.weight; o.subjectId = d.subjectId;
    o.dueDate = d.dueDate; o.isActive = d.isActive; o.createdAt = d.createdAt; o.updatedAt = d.updatedAt;
    return o;
  }
}
