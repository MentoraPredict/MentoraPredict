import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSessionEntity, ClassSessionStatus } from '../../domain/entities/class-session.entity';
import { IClassSessionRepository } from '../../application/ports/output/i-class-session.repository';
import { ClassSessionOrmEntity } from './class-session.orm-entity';

@Injectable()
export class ClassSessionRepository implements IClassSessionRepository {
  constructor(
    @InjectRepository(ClassSessionOrmEntity)
    private readonly repo: Repository<ClassSessionOrmEntity>,
  ) {}

  async findById(id: string): Promise<ClassSessionEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findBySubjectId(subjectId: string): Promise<ClassSessionEntity[]> {
    const list = await this.repo.find({
      where: { subjectId },
      order: { sessionDate: 'ASC' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async findBySubjectWeek(
    subjectId: string,
    academicWeek: number,
    academicYear: number,
  ): Promise<ClassSessionEntity[]> {
    const list = await this.repo.find({
      where: { subjectId, academicWeek, academicYear },
      order: { sessionDate: 'ASC' },
    });
    return list.map((o) => this.toDomain(o));
  }

  async saveMany(sessions: ClassSessionEntity[]): Promise<void> {
    if (sessions.length === 0) return;
    await this.repo.save(sessions.map((s) => this.toOrm(s)));
  }

  private toDomain = (o: ClassSessionOrmEntity): ClassSessionEntity =>
    new ClassSessionEntity(
      o.id,
      o.subjectId,
      o.scheduleId,
      o.sessionDate,
      o.academicWeek,
      o.academicYear,
      o.status as ClassSessionStatus,
      o.createdAt,
      o.updatedAt,
    );

  private toOrm(d: ClassSessionEntity): ClassSessionOrmEntity {
    const o = new ClassSessionOrmEntity();
    o.id = d.id;
    o.subjectId = d.subjectId;
    o.scheduleId = d.scheduleId;
    o.sessionDate = d.sessionDate;
    o.academicWeek = d.academicWeek;
    o.academicYear = d.academicYear;
    o.status = d.status;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
