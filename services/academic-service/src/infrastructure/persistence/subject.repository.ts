import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubjectEntity } from "../../domain/entities/subject.entity";
import { ISubjectRepository } from "../../application/ports/output/i-subject.repository";
import { SubjectOrmEntity } from "./subject.orm-entity";

@Injectable()
export class SubjectRepository implements ISubjectRepository {
  constructor(
    @InjectRepository(SubjectOrmEntity)
    private readonly repo: Repository<SubjectOrmEntity>,
  ) {}

  async findById(id: string): Promise<SubjectEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByAcademicPeriodId(periodId: string): Promise<SubjectEntity[]> {
    const list = await this.repo.find({
      where: { academicPeriodId: periodId },
    });
    return list.map(this.toDomain);
  }

  async save(s: SubjectEntity): Promise<SubjectEntity> {
    const saved = await this.repo.save(this.toOrm(s));
    return this.toDomain(saved);
  }

  async update(s: SubjectEntity): Promise<SubjectEntity> {
    await this.repo.save(this.toOrm(s));
    return s;
  }

  private toDomain = (o: SubjectOrmEntity): SubjectEntity =>
    new SubjectEntity(
      o.id,
      o.name,
      o.code,
      o.credits,
      o.careerId,
      o.academicPeriodId,
      o.maxCapacity,
      o.teacherId,
      o.isActive,
      o.createdAt,
      o.updatedAt,
    );

  private toOrm(d: SubjectEntity): SubjectOrmEntity {
    const o = new SubjectOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.code = d.code;
    o.credits = d.credits;
    o.careerId = d.careerId;
    o.academicPeriodId = d.academicPeriodId;
    o.maxCapacity = d.maxCapacity;
    o.teacherId = d.teacherId;
    o.isActive = d.isActive;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
