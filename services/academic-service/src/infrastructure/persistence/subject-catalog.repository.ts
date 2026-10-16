import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { ISubjectCatalogRepository } from '../../application/ports/output/i-subject-catalog.repository';
import { SubjectCatalogOrmEntity } from './subject-catalog.orm-entity';

@Injectable()
export class SubjectCatalogRepository implements ISubjectCatalogRepository {
  constructor(
    @InjectRepository(SubjectCatalogOrmEntity)
    private readonly repo: Repository<SubjectCatalogOrmEntity>,
  ) {}

  async findById(id: string): Promise<SubjectCatalogEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByCode(code: string): Promise<SubjectCatalogEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async findAll(filters?: { careerId?: string }): Promise<SubjectCatalogEntity[]> {
    const qb = this.repo.createQueryBuilder('sc');
    if (filters?.careerId) {
      qb.andWhere('sc.careerId = :careerId', { careerId: filters.careerId });
    }
    qb.orderBy('sc.name', 'ASC');
    const list = await qb.getMany();
    return list.map((o) => this.toDomain(o));
  }

  async save(c: SubjectCatalogEntity): Promise<SubjectCatalogEntity> {
    const saved = await this.repo.save(this.toOrm(c));
    return this.toDomain(saved);
  }

  async update(c: SubjectCatalogEntity): Promise<SubjectCatalogEntity> {
    await this.repo.save(this.toOrm(c));
    return c;
  }

  private toDomain = (o: SubjectCatalogOrmEntity): SubjectCatalogEntity =>
    new SubjectCatalogEntity(
      o.id,
      o.name,
      o.description,
      o.code,
      o.credits,
      o.careerId,
      o.isActive,
      o.createdAt,
      o.updatedAt,
      o.area,
    );

  private toOrm(d: SubjectCatalogEntity): SubjectCatalogOrmEntity {
    const o = new SubjectCatalogOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.description = d.description;
    o.code = d.code;
    o.credits = d.credits;
    o.careerId = d.careerId;
    o.isActive = d.isActive;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    o.area = d.area;
    return o;
  }
}
