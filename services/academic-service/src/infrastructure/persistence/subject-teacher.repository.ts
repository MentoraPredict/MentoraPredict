import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import { ISubjectTeacherRepository } from '../../application/ports/output/i-subject-teacher.repository';
import { SubjectTeacherOrmEntity } from './subject-teacher.orm-entity';

@Injectable()
export class SubjectTeacherRepository implements ISubjectTeacherRepository {
  constructor(
    @InjectRepository(SubjectTeacherOrmEntity)
    private readonly repo: Repository<SubjectTeacherOrmEntity>,
  ) {}

  async findBySubjectTeacherAndPeriod(
    subjectId: string, teacherId: string, periodId: string,
  ): Promise<SubjectTeacherEntity | null> {
    const o = await this.repo.findOne({ where: { subjectId, teacherId, periodId } });
    return o ? new SubjectTeacherEntity(o.subjectId, o.teacherId, o.periodId) : null;
  }

  async save(assignment: SubjectTeacherEntity): Promise<SubjectTeacherEntity> {
    const o = new SubjectTeacherOrmEntity();
    o.subjectId = assignment.subjectId;
    o.teacherId = assignment.teacherId;
    o.periodId = assignment.periodId;
    await this.repo.save(o);
    return assignment;
  }
}
