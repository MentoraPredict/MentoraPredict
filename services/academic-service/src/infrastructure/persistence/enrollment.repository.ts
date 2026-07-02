import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  EnrollmentEntity,
  EnrollmentStatus,
} from "../../domain/entities/enrollment.entity";
import { IEnrollmentRepository } from "../../application/ports/output/i-enrollment.repository";
import { EnrollmentOrmEntity } from "./enrollment.orm-entity";

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentOrmEntity)
    private readonly repo: Repository<EnrollmentOrmEntity>,
  ) {}

  async findByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<EnrollmentEntity | null> {
    const o = await this.repo.findOne({ where: { studentId, subjectId } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentSubjectAndPeriod(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<EnrollmentEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId, periodId },
    });
    return o ? this.toDomain(o) : null;
  }

  async countActiveBySubject(subjectId: string): Promise<number> {
    return this.repo.count({ where: { subjectId, status: "ACTIVE" } });
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return (await this.repo.find({ where: { studentId } })).map(this.toDomain);
  }

  async findBySubjectId(subjectId: string): Promise<EnrollmentEntity[]> {
    return (await this.repo.find({ where: { subjectId } })).map(this.toDomain);
  }

  async save(e: EnrollmentEntity): Promise<EnrollmentEntity> {
    const saved = await this.repo.save(this.toOrm(e));
    return this.toDomain(saved);
  }

  private toDomain = (o: EnrollmentOrmEntity): EnrollmentEntity =>
    new EnrollmentEntity(
      o.id,
      o.studentId,
      o.subjectId,
      o.periodId,
      o.status as EnrollmentStatus,
      o.enrolledAt,
      o.createdAt,
    );

  private toOrm(d: EnrollmentEntity): EnrollmentOrmEntity {
    const o = new EnrollmentOrmEntity();
    o.id = d.id;
    o.studentId = d.studentId;
    o.subjectId = d.subjectId;
    o.periodId = d.periodId;
    o.status = d.status;
    o.enrolledAt = d.enrolledAt;
    o.createdAt = d.createdAt;
    return o;
  }
}
