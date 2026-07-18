import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassScheduleEntity, DayOfWeek } from '../../domain/entities/class-schedule.entity';
import { IClassScheduleRepository } from '../../application/ports/output/i-class-schedule.repository';
import { ClassScheduleOrmEntity } from './class-schedule.orm-entity';

@Injectable()
export class ClassScheduleRepository implements IClassScheduleRepository {
  constructor(
    @InjectRepository(ClassScheduleOrmEntity)
    private readonly repo: Repository<ClassScheduleOrmEntity>,
  ) {}

  async findById(id: string): Promise<ClassScheduleEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findBySubjectId(subjectId: string): Promise<ClassScheduleEntity[]> {
    const list = await this.repo.find({ where: { subjectId }, order: { dayOfWeek: 'ASC' } });
    return list.map((o) => this.toDomain(o));
  }

  async saveMany(schedules: ClassScheduleEntity[]): Promise<ClassScheduleEntity[]> {
    if (schedules.length === 0) return [];
    const saved = await this.repo.save(schedules.map((s) => this.toOrm(s)));
    return saved.map((o) => this.toDomain(o));
  }

  async deleteBySubjectId(subjectId: string): Promise<void> {
    await this.repo.delete({ subjectId });
  }

  private toDomain = (o: ClassScheduleOrmEntity): ClassScheduleEntity =>
    new ClassScheduleEntity(
      o.id,
      o.subjectId,
      o.dayOfWeek as DayOfWeek,
      o.startTime,
      o.endTime,
      o.createdAt,
      o.updatedAt,
    );

  private toOrm(d: ClassScheduleEntity): ClassScheduleOrmEntity {
    const o = new ClassScheduleOrmEntity();
    o.id = d.id;
    o.subjectId = d.subjectId;
    o.dayOfWeek = d.dayOfWeek;
    o.startTime = d.startTime;
    o.endTime = d.endTime;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
