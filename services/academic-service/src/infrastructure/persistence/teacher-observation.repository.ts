import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TeacherObservationEntity, ObservationType,
} from '../../domain/entities/teacher-observation.entity';
import { ITeacherObservationRepository } from '../../application/ports/output/i-teacher-observation.repository';
import { TeacherObservationOrmEntity } from './teacher-observation.orm-entity';

@Injectable()
export class TeacherObservationRepository implements ITeacherObservationRepository {
  constructor(
    @InjectRepository(TeacherObservationOrmEntity)
    private readonly repo: Repository<TeacherObservationOrmEntity>,
  ) {}

  async save(observation: TeacherObservationEntity): Promise<TeacherObservationEntity> {
    await this.repo.insert({
      id: observation.id,
      studentId: observation.studentId,
      teacherId: observation.teacherId,
      subjectId: observation.subjectId,
      type: observation.type,
      content: observation.content,
    });
    return observation;
  }

  async findByStudentId(studentId: string): Promise<TeacherObservationEntity[]> {
    const rows = await this.repo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => new TeacherObservationEntity(
      r.id,
      r.studentId,
      r.teacherId,
      r.subjectId,
      r.type as ObservationType,
      r.content,
      r.createdAt,
    ));
  }
}
