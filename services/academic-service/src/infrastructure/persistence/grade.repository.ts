import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeEntity } from '../../domain/entities/grade.entity';
import { IGradeRepository } from '../../application/ports/output/i-grade.repository';
import { GradeOrmEntity } from './grade.orm-entity';

@Injectable()
export class GradeRepository implements IGradeRepository {
  constructor(@InjectRepository(GradeOrmEntity) private readonly repo: Repository<GradeOrmEntity>) {}

  async findByStudentAndEvaluation(studentId: string, evaluationId: string): Promise<GradeEntity | null> {
    const o = await this.repo.findOne({ where: { studentId, evaluationId } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentId(studentId: string): Promise<GradeEntity[]> {
    return (await this.repo.find({ where: { studentId } })).map(this.toDomain);
  }

  async findByEvaluationId(evaluationId: string): Promise<GradeEntity[]> {
    return (await this.repo.find({ where: { evaluationId } })).map(this.toDomain);
  }

  async save(g: GradeEntity): Promise<GradeEntity> {
    const saved = await this.repo.save(this.toOrm(g));
    return this.toDomain(saved);
  }

  private toDomain = (o: GradeOrmEntity): GradeEntity =>
    new GradeEntity(o.id, o.studentId, o.evaluationId, Number(o.value), o.recordedBy, o.recordedAt, o.createdAt, o.updatedAt);

  private toOrm(d: GradeEntity): GradeOrmEntity {
    const o = new GradeOrmEntity();
    o.id = d.id; o.studentId = d.studentId; o.evaluationId = d.evaluationId;
    o.value = d.value; o.recordedBy = d.recordedBy; o.recordedAt = d.recordedAt;
    o.createdAt = d.createdAt; o.updatedAt = d.updatedAt;
    return o;
  }
}
