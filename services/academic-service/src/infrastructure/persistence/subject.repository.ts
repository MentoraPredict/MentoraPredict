import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubjectEntity } from "../../domain/entities/subject.entity";
import { ISubjectRepository } from "../../application/ports/output/i-subject.repository";
import { SubjectOrmEntity } from "./subject.orm-entity";

const WITH_CATALOG = { subjectCatalog: true } as const;

@Injectable()
export class SubjectRepository implements ISubjectRepository {
  constructor(
    @InjectRepository(SubjectOrmEntity)
    private readonly repo: Repository<SubjectOrmEntity>,
  ) {}

  async findById(id: string): Promise<SubjectEntity | null> {
    const o = await this.repo.findOne({ where: { id }, relations: WITH_CATALOG });
    return o ? this.toDomain(o) : null;
  }

  async findByAcademicPeriodId(periodId: string): Promise<SubjectEntity[]> {
    const list = await this.repo.find({
      where: { academicPeriodId: periodId },
      relations: WITH_CATALOG,
    });
    return list.map((o) => this.toDomain(o));
  }

  async findAll(filters?: { careerId?: string; periodId?: string }): Promise<SubjectEntity[]> {
    const qb = this.repo
      .createQueryBuilder("s")
      .leftJoinAndSelect("s.subjectCatalog", "sc");
    if (filters?.careerId) {
      qb.andWhere("sc.careerId = :careerId", { careerId: filters.careerId });
    }
    if (filters?.periodId) {
      qb.andWhere("s.academicPeriodId = :periodId", { periodId: filters.periodId });
    }
    qb.orderBy("s.createdAt", "ASC");
    const list = await qb.getMany();
    return list.map((o) => this.toDomain(o));
  }

  async findByCatalogAndPeriod(subjectCatalogId: string, periodId: string): Promise<SubjectEntity | null> {
    const o = await this.repo.findOne({
      where: { subjectCatalogId, academicPeriodId: periodId },
      relations: WITH_CATALOG,
    });
    return o ? this.toDomain(o) : null;
  }

  async hasAcademicRecords(subjectId: string): Promise<boolean> {
    const count = await this.repo.manager
      .getRepository("enrollments")
      .createQueryBuilder("e")
      .where("e.subject_id = :subjectId", { subjectId })
      .getCount();
    return count > 0;
  }

  async save(s: SubjectEntity): Promise<SubjectEntity> {
    const saved = await this.repo.save(this.toOrm(s));
    return this.toDomain(saved, s);
  }

  async update(s: SubjectEntity): Promise<SubjectEntity> {
    await this.repo.save(this.toOrm(s));
    return s;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // `fallback` cubre el instante justo después de `save()`: TypeORM's
  // `.save()` no re-hidrata la relación `subjectCatalog` en el objeto que
  // devuelve, así que se usa la entidad de dominio ya en memoria (que trae
  // los campos del catálogo recién resueltos en el use-case) en vez de
  // volver a golpear la base.
  private toDomain = (o: SubjectOrmEntity, fallback?: SubjectEntity): SubjectEntity =>
    new SubjectEntity(
      o.id,
      o.subjectCatalog?.name ?? fallback?.name ?? '',
      o.subjectCatalog?.description ?? fallback?.description ?? '',
      o.subjectCatalog?.code ?? fallback?.code ?? '',
      o.subjectCatalog?.credits ?? fallback?.credits ?? 0,
      o.subjectCatalog?.careerId ?? fallback?.careerId ?? '',
      o.academicPeriodId,
      o.maxCapacity,
      o.teacherId,
      o.isActive,
      o.createdAt,
      o.updatedAt,
      o.imageUrl,
      o.subjectCatalogId,
    );

  private toOrm(d: SubjectEntity): SubjectOrmEntity {
    const o = new SubjectOrmEntity();
    o.id = d.id;
    o.subjectCatalogId = d.subjectCatalogId;
    o.academicPeriodId = d.academicPeriodId;
    o.maxCapacity = d.maxCapacity;
    o.teacherId = d.teacherId;
    o.isActive = d.isActive;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    o.imageUrl = d.imageUrl;
    return o;
  }
}
